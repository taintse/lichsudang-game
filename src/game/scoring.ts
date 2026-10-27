import type { Challenge } from '../data/questions';
import { haversineKm, unproject } from '../geo/vietnam';
import { PLACES } from '../geo/places';
import { clamp } from './text';

export interface TimelinePending {
  kind: 'timeline';
  order: string[];
  at: number;
}
export interface MapPending {
  kind: 'map';
  x: number;
  y: number;
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
export type Pending = TimelinePending | MapPending | CluePending | MatchPending | BetPending;

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
    if (!pending || pending.kind !== 'map' || !Number.isFinite(pending.x) || !Number.isFinite(pending.y)) {
      return { perfect: false, base: 0, wagerDelta: 0, note: 'Chưa ghim' };
    }
    const guess = unproject(pending.x, pending.y);
    const place = PLACES[challenge.placeId];
    const km = haversineKm(guess, place);
    const band = mapBand(km);
    const speed = band.perfect ? Math.round(350 * remainRatio(pending.at - startedAt, timeLimitMs)) : 0;
    const rounded = Math.max(0, Math.round(km));
    return {
      perfect: band.perfect,
      base: band.base + speed,
      wagerDelta: 0,
      note: `Cách ${place.name} khoảng ${rounded} km`,
      km,
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
