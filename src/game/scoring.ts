import type { Challenge } from '../data/questions';
import { clamp } from './text';

export interface TimelinePending {
  kind: 'timeline';
  order: string[];
  at: number;
}
export interface MapPending {
  kind: 'map';
  choice: string;
  at: number;
}
export interface CluePending {
  kind: 'clues';
  wrong: number;
  solved: boolean;
  solvedAt: number | null;
  rejected: string[];
}
export interface MatchPending {
  kind: 'match';
  pairs: { leftId: string; rightId: string }[];
  mistakes: number;
  doneAt: number | null;
}
export interface BetPending {
  kind: 'bet';
  pct: number;
  optionId: string;
  at: number;
}
export interface BucketPending {
  kind: 'bucket';
  picks: { id: string; side: 'left' | 'right' }[];
  at: number;
}
export interface RecruitPending {
  kind: 'recruit';
  ids: string[];
  at: number;
}
export type Pending = TimelinePending | MapPending | CluePending | MatchPending | BetPending | BucketPending | RecruitPending;

export interface Grade {
  perfect: boolean;
  /** Flat points before the combo multiplier. Negative means a penalty. */
  base: number;
  /** Wager profit or loss. Not multiplied by combo. */
  wagerDelta: number;
  note: string;
  km?: number;
}

export function comboMultiplier(streak: number): number {
  if (streak <= 1) return 1;
  return Math.min(1.6, 1 + (streak - 1) * 0.15);
}

export function orderStats(submitted: string[], correct: string[]): { accuracy: number; correctPairs: number; totalPairs: number } {
  const rank = new Map(correct.map((id, i) => [id, i]));
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const id of submitted) {
    if (rank.has(id) && !seen.has(id)) {
      seen.add(id);
      clean.push(id);
    }
  }
  for (const id of correct) if (!seen.has(id)) clean.push(id);
  const seq = clean.map((id) => rank.get(id) ?? 0);
  let correctPairs = 0;
  let totalPairs = 0;
  for (let i = 0; i < seq.length; i++) {
    for (let j = i + 1; j < seq.length; j++) {
      totalPairs++;
      if (seq[i] < seq[j]) correctPairs++;
    }
  }
  return { accuracy: totalPairs ? correctPairs / totalPairs : 0, correctPairs, totalPairs };
}

export function mapBand(km: number): { base: number; perfect: boolean } {
  if (km <= 65) return { base: 1000, perfect: true };
  if (km <= 110) return { base: 700, perfect: false };
  if (km <= 180) return { base: 450, perfect: false };
  if (km <= 300) return { base: 220, perfect: false };
  if (km <= 450) return { base: 80, perfect: false };
  return { base: 0, perfect: false };
}

function remainRatio(elapsedMs: number, timeLimitMs: number): number {
  if (timeLimitMs <= 0) return 0;
  return clamp(1 - elapsedMs / timeLimitMs, 0, 1);
}

export function gradeAnswer(
  challenge: Challenge,
  pending: Pending | null,
  timeLimitMs: number,
  startedAt: number,
  matchKey: Record<string, string> | null,
  scoreBefore: number,
): Grade {
  if (challenge.t === 'timeline') {
    const correct = [...challenge.items].sort((a, b) => a.sort - b.sort).map((item) => item.id);
    if (!pending || pending.kind !== 'timeline') {
      return { perfect: false, base: 0, wagerDelta: 0, note: 'Chưa xếp' };
    }
    const stats = orderStats(pending.order, correct);
    const perfect = stats.accuracy === 1;
    const speed = perfect ? Math.round(400 * remainRatio(pending.at - startedAt, timeLimitMs)) : 0;
    const base = Math.round(1000 * stats.accuracy) + speed;
    const note = perfect ? 'Đúng thứ tự' : `Đúng ${stats.correctPairs}/${stats.totalPairs} cặp thứ tự`;
    return { perfect, base, wagerDelta: 0, note };
  }

  if (challenge.t === 'map') {
    if (!pending || pending.kind !== 'map' || !pending.choice) {
      return { perfect: false, base: 0, wagerDelta: 0, note: 'Chưa chọn' };
    }
    const optionId = matchKey?.[pending.choice];
    const correct = optionId === challenge.correctId;
    const speed = correct ? Math.round(400 * remainRatio(pending.at - startedAt, timeLimitMs)) : 0;
    return {
      perfect: correct,
      base: correct ? 1000 + speed : 0,
      wagerDelta: 0,
      note: correct ? 'Đúng địa điểm' : 'Sai địa điểm',
    };
  }

  if (challenge.t === 'clues') {
    const solved = pending?.kind === 'clues' ? pending.solved : false;
    const wrong = pending?.kind === 'clues' ? pending.wrong : 0;
    const solvedAt = pending?.kind === 'clues' ? pending.solvedAt : null;
    if (!solved || solvedAt == null) {
      const penalty = Math.min(480, wrong * 120);
      return {
        perfect: false,
        base: penalty ? -penalty : 0,
        wagerDelta: 0,
        note: wrong ? `${wrong} lần đoán sai` : 'Chưa trả lời',
      };
    }
    const ratio = remainRatio(solvedAt - startedAt, timeLimitMs);
    const gained = Math.round(250 + 950 * ratio);
    const base = Math.max(0, gained - wrong * 120);
    return {
      perfect: wrong === 0,
      base,
      wagerDelta: 0,
      note: wrong === 0 ? 'Đúng ngay' : `Đúng sau ${wrong} lần đoán sai`,
    };
  }

  if (challenge.t === 'bucket') {
    if (!pending || pending.kind !== 'bucket') {
      return { perfect: false, base: 0, wagerDelta: 0, note: 'Chưa xếp' };
    }
    const want = new Map(challenge.cards.map((card) => [card.id, card.bucket]));
    const seen = new Set<string>();
    let correct = 0;
    for (const pick of pending.picks) {
      if (seen.has(pick.id) || !want.has(pick.id)) continue;
      seen.add(pick.id);
      if (want.get(pick.id) === pick.side) correct += 1;
    }
    const total = challenge.cards.length;
    const perfect = total > 0 && correct === total && seen.size === total;
    const speed = perfect ? Math.round(400 * remainRatio(pending.at - startedAt, timeLimitMs)) : 0;
    return {
      perfect,
      base: Math.round(1000 * (total ? correct / total : 0)) + speed,
      wagerDelta: 0,
      note: perfect ? 'Đúng cả hai phía' : `Đúng ${correct}/${total} thẻ`,
    };
  }

  if (challenge.t === 'recruit') {
    if (!pending || pending.kind !== 'recruit') {
      return { perfect: false, base: 0, wagerDelta: 0, note: 'Chưa chiêu mộ' };
    }
    const selected = new Set(pending.ids);
    let okTotal = 0;
    let hit = 0;
    let wrong = 0;
    for (const card of challenge.cards) {
      if (card.ok) {
        okTotal += 1;
        if (selected.has(card.id)) hit += 1;
      } else if (selected.has(card.id)) wrong += 1;
    }
    const perfect = okTotal > 0 && hit === okTotal && wrong === 0;
    const speed = perfect ? Math.round(400 * remainRatio(pending.at - startedAt, timeLimitMs)) : 0;
    const base = Math.round(1000 * (okTotal ? hit / okTotal : 0)) - wrong * 180 + speed;
    return {
      perfect,
      base,
      wagerDelta: 0,
      note: perfect ? 'Đủ lực lượng' : `Đúng ${hit}/${okTotal} · chọn nhầm ${wrong}`,
    };
  }

  if (challenge.t === 'match') {
    const pairs = pending?.kind === 'match' ? pending.pairs : [];
    const mistakes = pending?.kind === 'match' ? pending.mistakes : 0;
    const doneAt = pending?.kind === 'match' ? pending.doneAt : null;
    const key = matchKey ?? {};
    let correct = 0;
    for (const pair of pairs) if (key[pair.leftId] === pair.rightId) correct++;
    const total = challenge.pairs.length;
    const all = total > 0 && correct === total;
    const speed = all && doneAt != null ? Math.round(400 * remainRatio(doneAt - startedAt, timeLimitMs)) : 0;
    const base = Math.max(0, Math.round(1000 * (total ? correct / total : 0)) - mistakes * 50) + speed;
    return {
      perfect: all && mistakes === 0,
      base,
      wagerDelta: 0,
      note: `${correct}/${total} cặp đúng`,
    };
  }

  const pct = pending?.kind === 'bet' ? pending.pct : 0;
  const optionId = pending?.kind === 'bet' ? pending.optionId : '';
  const at = pending?.kind === 'bet' ? pending.at : startedAt + timeLimitMs;
  const correct = optionId === challenge.correctId;
  const wager = Math.max(0, Math.min(scoreBefore, Math.round((scoreBefore * pct) / 100)));
  const ratio = remainRatio(at - startedAt, timeLimitMs);
  const flat = correct ? Math.round(120 + 180 * ratio) : 0;
  const picked = challenge.options.find((option) => option.id === optionId);
  const note = !picked ? 'Không đặt cược' : correct ? `Cược đúng ${wager} điểm` : `Mất ${wager} điểm cược`;
  return {
    perfect: correct && !!picked,
    base: flat,
    wagerDelta: correct ? wager : picked ? -wager : 0,
    note,
  };
}

export function applyTwist(challenge: Challenge, grade: Grade, answered: boolean): Grade {
  if (!challenge.event || !answered) return grade;
  if (challenge.event === 'double' && grade.base > 0) {
    return { ...grade, base: grade.base * 2, note: `${grade.note} · nhân đôi` };
  }
  if (challenge.event === 'spy' && !grade.perfect) {
    return { ...grade, base: grade.base - 200, note: `${grade.note} · mật thám` };
  }
  return grade;
}

export function spentMs(pending: Pending | null, startedAt: number, timeLimitMs: number): number {
  if (!pending) return timeLimitMs;
  const cap = (at: number) => Math.max(0, Math.min(timeLimitMs, at - startedAt));
  if (pending.kind === 'clues') return pending.solvedAt == null ? timeLimitMs : cap(pending.solvedAt);
  if (pending.kind === 'match') return pending.doneAt == null ? timeLimitMs : cap(pending.doneAt);
  return cap(pending.at);
}

export function applyGrade(score: number, combo: number, grade: Grade): { score: number; combo: number; delta: number } {
  let nextCombo = combo;
  let delta: number;
  if (grade.perfect) {
    nextCombo += 1;
    delta = Math.round(grade.base * comboMultiplier(nextCombo)) + grade.wagerDelta;
  } else {
    nextCombo = 0;
    delta = grade.base + grade.wagerDelta;
  }
  return { score: Math.max(0, score + delta), combo: nextCombo, delta };
}
