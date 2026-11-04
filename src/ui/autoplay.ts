import { useEffect, type RefObject } from 'react';
import type { GameRoom } from '../game/room';

/** Advance intro, question, reveal, board, and the award steps when their deadline passes.
 *  The award gate itself waits for the host. Pause blocks the question clock. */
export function useAutoAdvance(roomRef: RefObject<GameRoom | null>) {
  useEffect(() => {
    const id = window.setInterval(() => {
      const room = roomRef.current;
      if (!room) return;
      const state = room.getState();
      if (state.paused || state.deadline == null) return;
      if (Date.now() < state.deadline) return;
      if (state.phase === 'podium') room.advanceCeremony();
      else if (state.phase === 'intro' || state.phase === 'play' || state.phase === 'reveal' || state.phase === 'board') room.next();
    }, 200);
    return () => window.clearInterval(id);
  }, [roomRef]);
}
