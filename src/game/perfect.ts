import type { GameRoom } from './room';

/** Practice-only: submit a correct answer for one local player. */
export function submitPerfect(room: GameRoom, playerId: string) {
  if (room.getState().phase !== 'play') return;
  const key = room.debugKey();
  const challenge = room.getState().live?.challenge;
  if (!key || !challenge) return;
  if (key.t === 'timeline' && key.order) {
    room.handleClient({ t: 'timeline', playerId, order: key.order });
  } else if (key.t === 'map' && key.optionId) {
    room.handleClient({ t: 'map', playerId, choice: key.optionId });
  } else if (key.t === 'clues' && key.answer) {
    room.handleClient({ t: 'clue', playerId, text: key.answer });
  } else if (key.t === 'match' && key.pairs) {
    for (const pair of key.pairs) room.handleClient({ t: 'match', playerId, leftId: pair.leftId, rightId: pair.rightId });
  } else if (key.t === 'bet' && key.optionId && challenge.t === 'bet') {
    room.handleClient({ t: 'bet', playerId, wagerPct: 25, optionId: key.optionId });
  }
}
