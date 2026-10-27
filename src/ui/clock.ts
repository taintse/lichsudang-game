import type { PublicState } from '../game/types';

export function remainingMs(pub: PublicState, now: number): number {
  if (pub.phase !== 'play') return 0;
  if (pub.paused) return pub.pausedRemainingMs ?? 0;
  if (pub.deadline == null) return 0;
  return Math.max(0, pub.deadline - now);
}

export function elapsedMs(pub: PublicState, now: number): number {
  if (pub.challengeStartedAt == null || !pub.challenge) return 0;
  if (pub.paused && pub.pausedRemainingMs != null) {
    return Math.max(0, pub.challenge.timeLimit * 1000 - pub.pausedRemainingMs);
  }
  return Math.max(0, now - pub.challengeStartedAt);
}

export function ceremonyStep(startedAt: number | null, now: number): number {
  if (startedAt == null) return 0;
  const t = now - startedAt;
  if (t < 1600) return 0;
  if (t < 4300) return 1;
  if (t < 7400) return 2;
  if (t < 10800) return 3;
  return 4;
}
