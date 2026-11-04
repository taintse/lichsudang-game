/** Scheduled lengths for the auto-advancing run.
 *  The run stops at the award gate. There is no overall countdown on the projector.
 *  The ceremony starts only when the host presses Trao giải, so it is not part of this budget.
 */
import { CHALLENGES } from './questions';

export const INTRO_MS = 7_000;
export const REVEAL_MS = 10_000;
export const BOARD_MS = 6_000;
export const BET_WAGER_MS = 8_000;
export const SESSION_LIMIT_MS = 12 * 60 * 1000;

export function introCount(): number {
  let count = 0;
  let prev = '';
  for (const challenge of CHALLENGES) {
    if (challenge.stageId !== prev) {
      count += 1;
      prev = challenge.stageId;
    }
  }
  return count;
}

/** Milliseconds from the first stage card to the award gate, if nobody skips. */
export function scheduledRunMs(): number {
  const answerMs = CHALLENGES.reduce((sum, challenge) => sum + challenge.timeLimit * 1000, 0);
  const wagers = CHALLENGES.filter((challenge) => challenge.t === 'bet').length * BET_WAGER_MS;
  return introCount() * INTRO_MS + wagers + answerMs + CHALLENGES.length * (REVEAL_MS + BOARD_MS);
}
