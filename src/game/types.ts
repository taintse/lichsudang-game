import type { ThemeId } from '../data/stages';

export type Phase = 'lobby' | 'intro' | 'play' | 'reveal' | 'board' | 'podium';

export interface StagePublic {
  id: string;
  year: string;
  title: string;
  kicker: string;
  blurb: string;
  howTo: string;
  theme: ThemeId;
}

export interface PublicTimeline {
  t: 'timeline';
  id: string;
  prompt: string;
  timeLimit: number;
  howTo: string;
  items: { id: string; text: string }[];
}

export interface PublicMap {
  t: 'map';
  id: string;
  prompt: string;
  timeLimit: number;
  howTo: string;
  markers: { id: string; x: number; y: number }[];
}

export interface PublicClues {
  t: 'clues';
  id: string;
  prompt: string;
  timeLimit: number;
  howTo: string;
  clues: { text: string; revealAt: number }[];
  options: string[];
}

export interface PublicMatch {
  t: 'match';
  id: string;
  prompt: string;
  timeLimit: number;
  howTo: string;
  left: { id: string; text: string }[];
  right: { id: string; text: string }[];
}

export interface PublicBet {
  t: 'bet';
  id: string;
  scenario: string;
  question: string;
  timeLimit: number;
  howTo: string;
  options: { id: string; text: string }[];
}

export type PublicChallenge = PublicTimeline | PublicMap | PublicClues | PublicMatch | PublicBet;

export interface RevealPublic {
  headline: string;
  explanation: string;
  timeline?: { text: string; year: string }[];
  map?: { choices: { id: string; x: number; y: number; label: string; count: number; correct: boolean }[] };
  pairs?: { left: string; right: string }[];
}

export interface PublicPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  combo: number;
  rank: number;
  prevRank: number;
  connected: boolean;
  submitted: boolean;
}

export interface PublicState {
  code: string;
  phase: Phase;
  paused: boolean;
  serverNow: number;
  deadline: number | null;
  challengeStartedAt: number | null;
  pausedRemainingMs: number | null;
  challengePos: number;
  challengeCount: number;
  stage: StagePublic | null;
  challenge: PublicChallenge | null;
  reveal: RevealPublic | null;
  players: PublicPlayer[];
  ceremonyStartedAt: number | null;
  /** Increments on every authoritative change so late broker copies are ignored. */
  rev: number;
  /** Host reset scores and returned this room to the lobby. */
  restarted: boolean;
  capitalNote: boolean;
  /** On the leaderboard, the next host action opens a new stage. */
  stageBreakNext: boolean;
  /** On the leaderboard, the next host action opens the podium. */
  finalNext: boolean;
}

export interface YouState {
  playerId: string;
  name: string;
  avatar: string;
  score: number;
  combo: number;
  rank: number;
  submitted: boolean;
  rejected: string[];
  matchedPairs: { leftId: string; rightId: string }[];
  mistakeSeq: number;
  solved: boolean;
  wrongGuesses: number;
  mapChoice: string | null;
  lastResult: null | { delta: number; correct: boolean; note: string };
  kicked: boolean;
}

export type ClientMessage =
  | { t: 'join'; playerId: string; name: string; avatar: string }
  | { t: 'timeline'; playerId: string; order: string[] }
  | { t: 'map'; playerId: string; choice: string }
  | { t: 'clue'; playerId: string; text: string }
  | { t: 'match'; playerId: string; leftId: string; rightId: string }
  | { t: 'bet'; playerId: string; wagerPct: number; optionId: string };

export type ServerMessage =
  | { t: 'state'; public: PublicState; you: YouState }
  | { t: 'kicked'; reason: string }
  | { t: 'error'; message: string }
  | { t: 'room-closed'; reason: string };

export const WAGER_PCTS = [0, 10, 25, 50, 100] as const;
export type WagerPct = (typeof WAGER_PCTS)[number];

export const AVATAR_IDS = [
  'star',
  'lotus',
  'torch',
  'drum',
  'lantern',
  'dove',
  'rice',
  'boat',
  'mountain',
  'book',
  'sun',
  'flag',
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export const AVATAR_LABELS: Record<AvatarId, string> = {
  star: 'Sao vàng',
  lotus: 'Hoa sen',
  torch: 'Đuốc',
  drum: 'Trống đồng',
  lantern: 'Đèn lồng',
  dove: 'Bồ câu',
  rice: 'Bông lúa',
  boat: 'Con thuyền',
  mountain: 'Đỉnh núi',
  book: 'Quyển sách',
  sun: 'Mặt trời',
  flag: 'Ngọn cờ',
};
