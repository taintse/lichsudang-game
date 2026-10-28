import { CHALLENGES } from '../data/questions';
import { stageById, type StageMeta } from '../data/stages';
import { AVATAR_IDS, type ClientMessage, type Phase, type PublicChallenge, type PublicState, type RevealPublic, type YouState } from './types';
import { cleanName, foldVi, fuzzyMatch } from './text';
import { applyGrade, gradeAnswer, type Pending } from './scoring';
import { buildReveal, buildRound, debugKey, type DebugKey } from './present';

const CAPITAL = 800;
const MAX_PLAYERS = 60;
const GRACE_MS = 400;

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  combo: number;
  rank: number;
  prevRank: number;
  connected: boolean;
  kicked: boolean;
  joinedAt: number;
  gotCapital: boolean;
  submitted: boolean;
  pending: Pending | null;
  rejected: string[];
  matchedPairs: { leftId: string; rightId: string }[];
  mistakeSeq: number;
  solved: boolean;
  wrongGuesses: number;
  mapPin: { x: number; y: number } | null;
  lastResult: YouState['lastResult'];
}

export interface LiveRound {
  challenge: PublicChallenge;
  matchKey: Record<string, string> | null;
}

export interface HostState {
  code: string;
  phase: Phase;
  paused: boolean;
  deadline: number | null;
  challengeStartedAt: number | null;
  pausedRemainingMs: number | null;
  challengePos: number;
  ceremonyStartedAt: number | null;
  capitalGranted: boolean;
  showCapitalNote: boolean;
  players: Player[];
  bannedIds: string[];
  bannedNames: string[];
  live: LiveRound | null;
  reveal: RevealPublic | null;
  rev: number;
  restarted: boolean;
}

export interface ClientResult {
  broadcast: boolean;
  personal: boolean;
  kick: boolean;
  error?: string;
}

function blankPlayer(id: string, name: string, avatar: string, joinedAt: number): Player {
  return {
    id,
    name,
    avatar,
    score: 0,
    combo: 0,
    rank: 1,
    prevRank: 1,
    connected: true,
    kicked: false,
    joinedAt,
    gotCapital: false,
    submitted: false,
    pending: null,
    rejected: [],
    matchedPairs: [],
    mistakeSeq: 0,
    solved: false,
    wrongGuesses: 0,
    mapPin: null,
    lastResult: null,
  };
}

function resetRound(player: Player) {
  player.submitted = false;
  player.pending = null;
  player.rejected = [];
  player.matchedPairs = [];
  player.mistakeSeq = 0;
  player.solved = false;
  player.wrongGuesses = 0;
  player.mapPin = null;
  player.lastResult = null;
}

export class GameRoom {
  private state: HostState;
  private listeners = new Set<() => void>();
  private now: () => number;

  constructor(opts: { code: string; now?: () => number; hydrate?: HostState }) {
    this.now = opts.now ?? (() => Date.now());
    this.state = opts.hydrate ?? {
      code: opts.code,
      phase: 'lobby',
      paused: false,
      deadline: null,
      challengeStartedAt: null,
      pausedRemainingMs: null,
      challengePos: -1,
      ceremonyStartedAt: null,
      capitalGranted: false,
      showCapitalNote: false,
      players: [],
      bannedIds: [],
      bannedNames: [],
      live: null,
      reveal: null,
      rev: 0,
      restarted: false,
    };
    this.state.rev = this.state.rev || 0;
    this.state.restarted = !!this.state.restarted;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getState(): HostState {
    return this.state;
  }

  exportState(): HostState {
    return JSON.parse(JSON.stringify(this.state)) as HostState;
  }

  private emit() {
    this.state.rev = (this.state.rev || 0) + 1;
    this.listeners.forEach((fn) => fn());
  }

  private clock() {
    return this.now();
  }

  private active(): Player[] {
    return this.state.players.filter((player) => !player.kicked);
  }

  private recomputeRanks() {
    const ranked = this.active().slice().sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt);
    ranked.forEach((player, index) => {
      player.rank = index + 1;
    });
  }

  private snapshotRanks() {
    for (const player of this.state.players) player.prevRank = player.rank || 1;
  }

  private find(id: string): Player | undefined {
    return this.state.players.find((player) => player.id === id && !player.kicked);
  }

  private currentChallenge() {
    return CHALLENGES[this.state.challengePos] ?? null;
  }

  private currentStage(): StageMeta | null {
    const challenge = this.currentChallenge();
    return challenge ? stageById(challenge.stageId) : null;
  }

  private accepting(): boolean {
    if (this.state.phase !== 'play' || this.state.paused) return false;
    if (this.state.deadline == null) return false;
    return this.clock() <= this.state.deadline + GRACE_MS;
  }

  private grantCapital() {
    this.state.capitalGranted = true;
    this.state.showCapitalNote = true;
    this.snapshotRanks();
    for (const player of this.active()) {
      if (!player.gotCapital) {
        player.score += CAPITAL;
        player.gotCapital = true;
      }
    }
    this.recomputeRanks();
  }

  private beginPlay() {
    const challenge = this.currentChallenge();
    const stage = this.currentStage();
    if (!challenge || !stage) return;
    const now = this.clock();
    const round = buildRound(challenge, stage.howTo, `${this.state.code}:${challenge.id}`);
    this.state.live = round;
    this.state.reveal = null;
    this.state.phase = 'play';
    this.state.paused = false;
    this.state.pausedRemainingMs = null;
    this.state.challengeStartedAt = now;
    this.state.deadline = now + challenge.timeLimit * 1000;
    for (const player of this.active()) resetRound(player);
  }

  private finalize() {
    const challenge = this.currentChallenge();
    const live = this.state.live;
    if (!challenge || !live || this.state.challengeStartedAt == null) return;
    const startedAt = this.state.challengeStartedAt;
    const timeLimitMs = challenge.timeLimit * 1000;
    this.snapshotRanks();
    const guesses: { x: number; y: number }[] = [];
    for (const player of this.active()) {
      if (player.pending?.kind === 'map') guesses.push({ x: player.pending.x, y: player.pending.y });
      const late = !player.pending && player.joinedAt > startedAt + 800;
      if (late) {
        player.lastResult = { delta: 0, correct: false, note: 'Vào giữa chừng' };
        continue;
      }
      const grade = gradeAnswer(challenge, player.pending, timeLimitMs, startedAt, live.matchKey, player.score);
      const applied = applyGrade(player.score, player.combo, grade);
      player.score = applied.score;
      player.combo = applied.combo;
      player.lastResult = {
        delta: applied.delta,
        correct: grade.perfect,
        note: grade.note,
      };
      player.submitted = true;
    }
    this.recomputeRanks();
    this.state.reveal = buildReveal(challenge, guesses);
    this.state.phase = 'reveal';
    this.state.paused = false;
    this.state.deadline = null;
    this.state.pausedRemainingMs = null;
  }

  start() {
    if (this.state.phase !== 'lobby') return;
    this.state.challengePos = 0;
    this.state.showCapitalNote = false;
    this.state.restarted = false;
    this.state.phase = 'intro';
    this.emit();
  }

  /** End the current round and open the podium with the scores people already have. */
  finishNow() {
    if (this.state.phase === 'podium' || this.state.phase === 'lobby') return;
    if (this.state.phase === 'play') this.finalize();
    this.state.phase = 'podium';
    this.state.live = null;
    this.state.paused = false;
    this.state.deadline = null;
    this.state.pausedRemainingMs = null;
    this.state.ceremonyStartedAt = this.clock();
    this.emit();
  }

  /** Same room, same players, scores back to zero, lobby. */
  replay() {
    if (this.state.phase !== 'podium') return;
    for (const player of this.active()) {
      player.score = 0;
      player.combo = 0;
      player.gotCapital = false;
      player.prevRank = player.rank;
      resetRound(player);
    }
    this.state.phase = 'lobby';
    this.state.challengePos = -1;
    this.state.ceremonyStartedAt = null;
    this.state.capitalGranted = false;
    this.state.showCapitalNote = false;
    this.state.paused = false;
    this.state.deadline = null;
    this.state.challengeStartedAt = null;
    this.state.pausedRemainingMs = null;
    this.state.live = null;
    this.state.reveal = null;
    this.state.restarted = true;
    this.recomputeRanks();
    this.emit();
  }

  /** Drop everyone. Used when solo practice starts over. */
  wipe() {
    this.state.players = [];
    this.state.bannedIds = [];
    this.state.bannedNames = [];
    this.state.phase = 'lobby';
    this.state.challengePos = -1;
    this.state.ceremonyStartedAt = null;
    this.state.capitalGranted = false;
    this.state.showCapitalNote = false;
    this.state.paused = false;
    this.state.deadline = null;
    this.state.challengeStartedAt = null;
    this.state.pausedRemainingMs = null;
    this.state.live = null;
    this.state.reveal = null;
    this.state.restarted = false;
    this.emit();
  }

  next() {
    const phase = this.state.phase;
    if (phase === 'lobby') {
      this.start();
      return;
    }
    if (phase === 'intro') {
      this.state.showCapitalNote = false;
      this.beginPlay();
      this.emit();
      return;
    }
    if (phase === 'play') {
      this.finalize();
      this.emit();
      return;
    }
    if (phase === 'reveal') {
      this.state.phase = 'board';
      this.emit();
      return;
    }
    if (phase === 'board') {
      const nextPos = this.state.challengePos + 1;
      if (nextPos >= CHALLENGES.length) {
        this.state.phase = 'podium';
        this.state.ceremonyStartedAt = this.clock();
        this.state.live = null;
        this.emit();
        return;
      }
      const prevStage = CHALLENGES[this.state.challengePos].stageId;
      const nextStage = CHALLENGES[nextPos].stageId;
      this.state.challengePos = nextPos;
      if (nextStage !== prevStage) {
        this.state.showCapitalNote = false;
        if (nextStage === 'doimoi') this.grantCapital();
        this.state.phase = 'intro';
        this.state.live = null;
        this.state.reveal = null;
      } else {
        this.beginPlay();
      }
      this.emit();
      return;
    }
    if (phase === 'podium') this.skipCeremony();
  }

  pause() {
    if (this.state.phase !== 'play' || this.state.paused || this.state.deadline == null) return;
    this.state.pausedRemainingMs = Math.max(0, this.state.deadline - this.clock());
    this.state.paused = true;
    this.emit();
  }

  resume() {
    if (!this.state.paused || this.state.pausedRemainingMs == null) return;
    const challenge = this.currentChallenge();
    if (!challenge) return;
    const now = this.clock();
    this.state.deadline = now + this.state.pausedRemainingMs;
    this.state.challengeStartedAt = now - (challenge.timeLimit * 1000 - this.state.pausedRemainingMs);
    this.state.paused = false;
    this.state.pausedRemainingMs = null;
    this.emit();
  }

  skipCeremony() {
    if (this.state.phase !== 'podium') return;
    this.state.ceremonyStartedAt = this.clock() - 20000;
    this.emit();
  }

  kick(playerId: string) {
    const player = this.state.players.find((item) => item.id === playerId);
    if (!player || player.kicked) return;
    player.kicked = true;
    player.connected = false;
    this.state.bannedIds.push(player.id);
    this.state.bannedNames.push(foldVi(player.name));
    this.recomputeRanks();
    this.emit();
  }

  disconnect(playerId: string) {
    const player = this.find(playerId);
    if (!player) return;
    player.connected = false;
    this.emit();
  }

  handleClient(message: ClientMessage): ClientResult {
    if (message.t === 'join') return this.join(message);
    return this.answer(message);
  }

  private join(message: Extract<ClientMessage, { t: 'join' }>): ClientResult {
    const playerId = message.playerId.trim();
    if (!/^[a-zA-Z0-9_-]{6,48}$/.test(playerId)) {
      return { broadcast: false, personal: false, kick: false, error: 'Mã người chơi không hợp lệ.' };
    }
    const name = cleanName(message.name);
    if (!name) return { broadcast: false, personal: false, kick: false, error: 'Tên không dùng được. Hãy chọn tên khác, tối đa 16 chữ.' };
    const avatar = (AVATAR_IDS as readonly string[]).includes(message.avatar) ? message.avatar : 'star';
    const folded = foldVi(name);
    if (this.state.bannedIds.includes(playerId) || this.state.bannedNames.includes(folded)) {
      return { broadcast: false, personal: false, kick: true, error: 'Bạn đã bị mời ra khỏi phòng.' };
    }

    const existing = this.state.players.find((player) => player.id === playerId);
    if (existing) {
      if (existing.kicked) return { broadcast: false, personal: false, kick: true };
      existing.connected = true;
      existing.avatar = avatar;
      this.emit();
      return { broadcast: true, personal: true, kick: false };
    }

    const sameName = this.state.players.filter((player) => !player.kicked && !player.connected && foldVi(player.name) === folded);
    if (sameName.length === 1) {
      sameName[0].id = playerId;
      sameName[0].connected = true;
      sameName[0].avatar = avatar;
      this.emit();
      return { broadcast: true, personal: true, kick: false };
    }

    if (this.active().length >= MAX_PLAYERS) {
      return { broadcast: false, personal: false, kick: false, error: 'Phòng đã đủ người.' };
    }
    let display = name;
    const taken = new Set(this.active().map((player) => foldVi(player.name)));
    if (taken.has(folded)) {
      let n = 2;
      while (taken.has(foldVi(`${name} ${n}`)) && n < 20) n++;
      display = `${name} ${n}`.slice(0, 16);
    }
    const player = blankPlayer(playerId, display, avatar, this.clock());
    if (this.state.capitalGranted) {
      player.score = CAPITAL;
      player.gotCapital = true;
    }
    this.state.players.push(player);
    this.recomputeRanks();
    player.prevRank = player.rank;
    this.emit();
    return { broadcast: true, personal: true, kick: false };
  }

  private answer(message: Exclude<ClientMessage, { t: 'join' }>): ClientResult {
    const player = this.find(message.playerId);
    if (!player) return { broadcast: false, personal: false, kick: false, error: 'Bạn chưa vào phòng.' };
    if (!this.accepting()) return { broadcast: false, personal: true, kick: false, error: 'Hết giờ hoặc giáo viên đang tạm dừng.' };
    const challenge = this.currentChallenge();
    const live = this.state.live;
    if (!challenge || !live) return { broadcast: false, personal: false, kick: false };
    const now = this.clock();

    if (message.t === 'timeline' && challenge.t === 'timeline') {
      if (player.submitted) return { broadcast: false, personal: true, kick: false };
      const allowed = new Set(challenge.items.map((item) => item.id));
      const order = message.order.filter((id) => allowed.has(id));
      player.pending = { kind: 'timeline', order, at: now };
      player.submitted = true;
      this.emit();
      return { broadcast: true, personal: true, kick: false };
    }

    if (message.t === 'map' && challenge.t === 'map') {
      if (player.submitted) return { broadcast: false, personal: true, kick: false };
      if (!Number.isFinite(message.x) || !Number.isFinite(message.y)) {
        return { broadcast: false, personal: true, kick: false, error: 'Vị trí không hợp lệ.' };
      }
      player.pending = { kind: 'map', x: message.x, y: message.y, at: now };
      player.mapPin = { x: message.x, y: message.y };
      player.submitted = true;
      this.emit();
      return { broadcast: true, personal: true, kick: false };
    }

    if (message.t === 'clue' && challenge.t === 'clues') {
      if (player.solved) return { broadcast: false, personal: true, kick: false };
      const text = message.text.slice(0, 80);
      const folded = foldVi(text);
      if (!player.pending || player.pending.kind !== 'clues') {
        player.pending = { kind: 'clues', wrong: 0, solved: false, solvedAt: null, rejected: [] };
      }
      const pending = player.pending;
      if (pending.kind !== 'clues') return { broadcast: false, personal: true, kick: false };
      if (pending.rejected.includes(folded)) {
        return { broadcast: false, personal: true, kick: false, error: 'Bạn đã đoán phương án này.' };
      }
      if (fuzzyMatch(text, challenge.aliases)) {
        pending.solved = true;
        pending.solvedAt = now;
        player.solved = true;
        player.submitted = true;
        this.emit();
        return { broadcast: true, personal: true, kick: false };
      }
      pending.wrong += 1;
      pending.rejected.push(folded);
      player.wrongGuesses = pending.wrong;
      player.rejected = pending.rejected.slice();
      player.mistakeSeq += 1;
      this.emit();
      return { broadcast: false, personal: true, kick: false };
    }

    if (message.t === 'match' && challenge.t === 'match') {
      if (!live.matchKey) return { broadcast: false, personal: false, kick: false };
      if (!player.pending || player.pending.kind !== 'match') {
        player.pending = { kind: 'match', pairs: [], mistakes: 0, doneAt: null };
      }
      const pending = player.pending;
      if (pending.kind !== 'match') return { broadcast: false, personal: true, kick: false };
      const leftIds = new Set(challenge.pairs.map((pair) => pair.id));
      const rightIds = new Set(Object.values(live.matchKey));
      if (!leftIds.has(message.leftId) || !rightIds.has(message.rightId)) {
        return { broadcast: false, personal: true, kick: false };
      }
      if (pending.pairs.some((pair) => pair.leftId === message.leftId || pair.rightId === message.rightId)) {
        return { broadcast: false, personal: true, kick: false };
      }
      if (live.matchKey[message.leftId] === message.rightId) {
        pending.pairs.push({ leftId: message.leftId, rightId: message.rightId });
        player.matchedPairs = pending.pairs.slice();
        if (pending.pairs.length === challenge.pairs.length) {
          pending.doneAt = now;
          player.submitted = true;
        }
        this.emit();
        return { broadcast: player.submitted, personal: true, kick: false };
      }
      pending.mistakes += 1;
      player.mistakeSeq += 1;
      this.emit();
      return { broadcast: false, personal: true, kick: false };
    }

    if (message.t === 'bet' && challenge.t === 'bet') {
      if (player.submitted) return { broadcast: false, personal: true, kick: false };
      const allowed = new Set([0, 10, 25, 50, 100]);
      if (!allowed.has(message.wagerPct)) {
        return { broadcast: false, personal: true, kick: false, error: 'Mức cược không hợp lệ.' };
      }
      if (!challenge.options.some((option) => option.id === message.optionId)) {
        return { broadcast: false, personal: true, kick: false, error: 'Hãy chọn một phương án.' };
      }
      player.pending = { kind: 'bet', pct: message.wagerPct, optionId: message.optionId, at: now };
      player.submitted = true;
      this.emit();
      return { broadcast: true, personal: true, kick: false };
    }

    return { broadcast: false, personal: true, kick: false, error: 'Thao tác không khớp với câu đang chơi.' };
  }

  publicState(): PublicState {
    const stage = this.currentStage();
    const players = this.active()
      .slice()
      .sort((a, b) => a.rank - b.rank || a.joinedAt - b.joinedAt)
      .map((player) => ({
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        score: player.score,
        combo: player.combo,
        rank: player.rank,
        prevRank: player.prevRank,
        connected: player.connected,
        submitted: player.submitted,
      }));
    return {
      code: this.state.code,
      phase: this.state.phase,
      paused: this.state.paused,
      serverNow: this.clock(),
      deadline: this.state.deadline,
      challengeStartedAt: this.state.challengeStartedAt,
      pausedRemainingMs: this.state.pausedRemainingMs,
      challengePos: this.state.challengePos,
      challengeCount: CHALLENGES.length,
      stage: stage
        ? {
            id: stage.id,
            year: stage.year,
            title: stage.title,
            kicker: stage.kicker,
            blurb: stage.blurb,
            howTo: stage.howTo,
            theme: stage.theme,
          }
        : null,
      challenge: this.state.phase === 'play' || this.state.phase === 'reveal' || this.state.phase === 'board' ? this.state.live?.challenge ?? null : null,
      reveal: this.state.phase === 'reveal' || this.state.phase === 'board' ? this.state.reveal : null,
      players,
      ceremonyStartedAt: this.state.ceremonyStartedAt,
      rev: this.state.rev || 0,
      restarted: !!this.state.restarted,
      capitalNote: this.state.showCapitalNote && this.state.phase === 'intro',
      stageBreakNext:
        this.state.phase === 'board' &&
        this.state.challengePos + 1 < CHALLENGES.length &&
        CHALLENGES[this.state.challengePos].stageId !== CHALLENGES[this.state.challengePos + 1].stageId,
      finalNext: this.state.phase === 'board' && this.state.challengePos + 1 >= CHALLENGES.length,
    };
  }

  youState(playerId: string): YouState | null {
    const player = this.state.players.find((item) => item.id === playerId);
    if (!player) return null;
    return {
      playerId: player.id,
      name: player.name,
      avatar: player.avatar,
      score: player.score,
      combo: player.combo,
      rank: player.rank,
      submitted: player.submitted,
      rejected: player.rejected.slice(),
      matchedPairs: player.matchedPairs.slice(),
      mistakeSeq: player.mistakeSeq,
      solved: player.solved,
      wrongGuesses: player.wrongGuesses,
      mapPin: player.mapPin ? { ...player.mapPin } : null,
      lastResult: player.lastResult ? { ...player.lastResult } : null,
      kicked: player.kicked,
    };
  }

  debugKey(): DebugKey | null {
    if (this.state.phase === 'lobby' || this.state.phase === 'podium') return null;
    return debugKey(this.state.challengePos, this.state.live?.matchKey ?? null);
  }
}

