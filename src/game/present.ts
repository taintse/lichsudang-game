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
  /** For match: left id → shuffled right id. For map: public marker id → option id. */
  matchKey: Record<string, string> | null;
  /** Public marker id of the correct map place. */
  answerId: string | null;
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
      answerId: null,
    };
  }
  if (challenge.t === 'map') {
    const markers = shuffle(
      challenge.options.map((option) => {
        const point = placePoint(option.placeId);
        return { id: sid(rand), x: Math.round(point.x), y: Math.round(point.y), optionId: option.id };
      }),
      rand,
    );
    const matchKey = Object.fromEntries(markers.map((marker) => [marker.id, marker.optionId]));
    const answer = markers.find((marker) => marker.optionId === challenge.correctId);
    return {
      matchKey,
      answerId: answer?.id ?? null,
      challenge: {
        t: 'map',
        id: challenge.id,
        prompt: challenge.prompt,
        timeLimit: challenge.timeLimit,
        howTo,
        markers: markers.map((marker) => ({ id: marker.id, x: marker.x, y: marker.y })),
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
      answerId: null,
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
      answerId: null,
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
    answerId: null,
  };
}

export function buildReveal(
  challenge: Challenge,
  mapCounts: Record<string, number> = {},
  markerKey: Record<string, string> | null = null,
): RevealPublic {
  if (challenge.t === 'timeline') {
    const ordered = [...challenge.items].sort((a, b) => a.sort - b.sort);
    return {
      headline: challenge.headline,
      explanation: challenge.explanation,
      timeline: ordered.map((item) => ({ text: item.text, year: item.year })),
    };
  }
  if (challenge.t === 'map') {
    return {
      headline: challenge.headline,
      explanation: challenge.explanation,
      map: {
        choices: challenge.options.map((option) => {
          const point = placePoint(option.placeId);
          const publicId = Object.entries(markerKey ?? {}).find(([, optionId]) => optionId === option.id)?.[0] ?? option.id;
          return {
            id: publicId,
            x: Math.round(point.x),
            y: Math.round(point.y),
            label: point.name,
            count: mapCounts[publicId] ?? 0,
            correct: option.id === challenge.correctId,
          };
        }),
      },
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
    const correct = challenge.options.find((option) => option.id === challenge.correctId);
    return { t: 'map', id: challenge.id, optionId: challenge.correctId, answer: correct ? placePoint(correct.placeId).name : '' };
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
