import { CHALLENGES, type Challenge } from '../data/questions';
import { stageById } from '../data/stages';
import { placePoint } from '../geo/places';
import type { PublicChallenge, RevealPublic } from './types';

export function mulberry32(seedText: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(list: T[], rand: () => number): T[] {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function sid(rand: () => number): string {
  return 'r' + Math.floor(rand() * 1e9).toString(36);
}

export interface BuiltRound {
  challenge: PublicChallenge;
  matchKey: Record<string, string> | null;
}

export function buildRound(challenge: Challenge, howTo: string, seed: string): BuiltRound {
  const rand = mulberry32(seed);
  if (challenge.t === 'timeline') {
    return {
      matchKey: null,
      challenge: {
        t: 'timeline',
        id: challenge.id,
        prompt: challenge.prompt,
        timeLimit: challenge.timeLimit,
        howTo,
        items: shuffle(
          challenge.items.map((item) => ({ id: item.id, text: item.text })),
          rand,
        ),
      },
    };
  }
  if (challenge.t === 'map') {
    return {
      matchKey: null,
      challenge: {
        t: 'map',
        id: challenge.id,
        prompt: challenge.prompt,
        timeLimit: challenge.timeLimit,
        howTo,
      },
    };
  }
  if (challenge.t === 'clues') {
    return {
      matchKey: null,
      challenge: {
        t: 'clues',
        id: challenge.id,
        prompt: challenge.prompt,
        timeLimit: challenge.timeLimit,
        howTo,
        clues: challenge.clues.map((clue) => ({ text: clue.text, revealAt: clue.revealAt })),
        options: shuffle(challenge.options.slice(), rand),
      },
    };
  }
  if (challenge.t === 'match') {
    const matchKey: Record<string, string> = {};
    const right = challenge.pairs.map((pair) => {
      const id = sid(rand);
      matchKey[pair.id] = id;
      return { id, text: pair.right };
    });
    return {
      matchKey,
      challenge: {
        t: 'match',
        id: challenge.id,
        prompt: challenge.prompt,
        timeLimit: challenge.timeLimit,
        howTo,
        left: shuffle(
          challenge.pairs.map((pair) => ({ id: pair.id, text: pair.left })),
          rand,
        ),
        right: shuffle(right, rand),
      },
    };
  }
  return {
    matchKey: null,
    challenge: {
      t: 'bet',
      id: challenge.id,
      scenario: challenge.scenario,
      question: challenge.question,
      timeLimit: challenge.timeLimit,
      howTo,
      options: shuffle(
        challenge.options.map((option) => ({ id: option.id, text: option.text })),
        rand,
      ),
    },
  };
}

export function buildReveal(challenge: Challenge, guesses: { x: number; y: number }[]): RevealPublic {
  if (challenge.t === 'timeline') {
    const ordered = [...challenge.items].sort((a, b) => a.sort - b.sort);
    return {
      headline: challenge.headline,
      explanation: challenge.explanation,
      timeline: ordered.map((item) => ({ text: item.text, year: item.year })),
    };
  }
  if (challenge.t === 'map') {
    const point = placePoint(challenge.placeId);
    return {
      headline: challenge.headline,
      explanation: challenge.explanation,
      map: { x: point.x, y: point.y, label: point.name, guesses },
    };
  }
  if (challenge.t === 'match') {
    return {
      headline: challenge.headline,
      explanation: challenge.explanation,
      pairs: challenge.pairs.map((pair) => ({ left: pair.left, right: pair.right })),
    };
  }
  return { headline: challenge.headline, explanation: challenge.explanation };
}

export function challengeCount(): number {
  return CHALLENGES.length;
}

export function stageForPos(pos: number) {
  const challenge = CHALLENGES[pos];
  if (!challenge) return null;
  return stageById(challenge.stageId);
}

export interface DebugKey {
  t: Challenge['t'];
  id: string;
  order?: string[];
  x?: number;
  y?: number;
  answer?: string;
  pairs?: { leftId: string; rightId: string }[];
  optionId?: string;
}

export function debugKey(pos: number, matchKey: Record<string, string> | null): DebugKey | null {
  const challenge = CHALLENGES[pos];
  if (!challenge) return null;
  if (challenge.t === 'timeline') {
    return {
      t: 'timeline',
      id: challenge.id,
      order: [...challenge.items].sort((a, b) => a.sort - b.sort).map((item) => item.id),
    };
  }
  if (challenge.t === 'map') {
    const point = placePoint(challenge.placeId);
    return { t: 'map', id: challenge.id, x: point.x, y: point.y, answer: point.name };
  }
  if (challenge.t === 'clues') {
    return { t: 'clues', id: challenge.id, answer: challenge.aliases[0] };
  }
  if (challenge.t === 'match') {
    return {
      t: 'match',
      id: challenge.id,
      pairs: challenge.pairs.map((pair) => ({ leftId: pair.id, rightId: matchKey?.[pair.id] ?? '' })),
    };
  }
  return { t: 'bet', id: challenge.id, optionId: challenge.correctId };
}
