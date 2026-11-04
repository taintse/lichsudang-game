import { describe, expect, it } from 'vitest';
import { GameRoom } from './room';
import { CHALLENGES } from '../data/questions';
import { foldVi, fuzzyMatch } from './text';
import { mapBand, orderStats } from './scoring';

function setup() {
  let now = 1_700_000_000_000;
  const room = new GameRoom({ code: 'AB7K', now: () => now });
  const join = (playerId: string, name: string, avatar = 'star') =>
    room.handleClient({ t: 'join', playerId, name, avatar });
  join('playerA1', 'An');
  join('playerB1', 'Bình', 'lotus');
  room.start();
  return {
    room,
    setNow(ms: number) {
      now = ms;
    },
    now: () => now,
  };
}

function answer(room: GameRoom, playerId: string, mode: 'perfect' | 'wrong') {
  const state = room.getState();
  if (state.phase !== 'play') throw new Error('not playing ' + state.phase);
  const key = room.debugKey();
  const challenge = state.live?.challenge;
  if (!key || !challenge) throw new Error('no key');
  if (key.t === 'timeline') {
    const order = mode === 'perfect' ? key.order! : [...key.order!].reverse();
    room.handleClient({ t: 'timeline', playerId, order });
  } else if (key.t === 'map' && challenge.t === 'map') {
    const wrong = challenge.markers.find((marker) => marker.id !== key.optionId)?.id ?? 'sai';
    room.handleClient({ t: 'map', playerId, choice: mode === 'perfect' ? key.optionId! : wrong });
  } else if (key.t === 'clues') {
    room.handleClient({ t: 'clue', playerId, text: mode === 'perfect' ? key.answer! : 'một đáp án sai rõ ràng' });
  } else if (key.t === 'match' && challenge.t === 'match') {
    if (mode === 'perfect') {
      for (const pair of key.pairs!) room.handleClient({ t: 'match', playerId, leftId: pair.leftId, rightId: pair.rightId });
    } else {
      const left = challenge.left[0];
      const wrongRight = challenge.right.find((item) => item.id !== key.pairs!.find((pair) => pair.leftId === left.id)?.rightId);
      if (left && wrongRight) room.handleClient({ t: 'match', playerId, leftId: left.id, rightId: wrongRight.id });
    }
  } else if (key.t === 'bet' && challenge.t === 'bet') {
    const optionId = mode === 'perfect' ? key.optionId! : challenge.options.find((option) => option.id !== key.optionId)!.id;
    room.handleClient({ t: 'bet', playerId, wagerPct: 100, optionId });
  }
}

describe('tiếng Việt và điểm', () => {
  it('bỏ dấu và bắt lỗi chính tả nhẹ', () => {
    expect(foldVi('Điện Biên Phủ')).toBe('dien bien phu');
    expect(fuzzyMatch('  dien   bien phu ', ['Điện Biên Phủ'])).toBe(true);
    expect(fuzzyMatch('Điện Biên Phủ trên không', ['Điện Biên Phủ'])).toBe(false);
    expect(fuzzyMatch('Hiệp định Giơ-ne-vơ (1954)', ['Hiệp định Giơ-ne-vơ (1954)'])).toBe(true);
    expect(fuzzyMatch('vo nguyen giap', ['Võ Nguyên Giáp'])).toBe(true);
    expect(fuzzyMatch('Hà Nội', ['Điện Biên Phủ'])).toBe(false);
  });

  it('chấm thứ tự và khoảng cách', () => {
    expect(orderStats(['a', 'b', 'c'], ['a', 'b', 'c']).accuracy).toBe(1);
    expect(orderStats(['c', 'b', 'a'], ['a', 'b', 'c']).accuracy).toBe(0);
    expect(mapBand(40).perfect).toBe(true);
    expect(mapBand(84).base).toBe(700);
    expect(mapBand(800).base).toBe(0);
  });
});

describe('phòng chơi', () => {
  it('giấu đáp án khi đang chơi và công bố khi mở đáp án', () => {
    const { room } = setup();
    room.next();
    const hidden = JSON.stringify(room.publicState());
    expect(hidden).not.toContain('3/2/1930');
    expect(hidden).not.toContain('correctId');
    expect(hidden).not.toContain('aliases');
    expect(hidden).not.toContain('22.94');
    expect(hidden).not.toContain('"sort"');
    room.next();
    const shown = JSON.stringify(room.publicState());
    expect(shown).toContain('3/2/1930');
    expect(room.publicState().reveal?.timeline?.[0].year).toBe('3/2/1930');
  });

  it('chơi đủ 5 chặng, cược tất tay có thể đảo hạng', () => {
    const { room } = setup();
    expect(CHALLENGES).toHaveLength(27);
    for (let i = 0; i < CHALLENGES.length; i++) {
      if (room.getState().phase === 'intro') room.next();
      expect(room.getState().phase).toBe('play');
      const betting = room.getState().live?.challenge.t === 'bet';
      answer(room, 'playerA1', betting ? 'wrong' : 'perfect');
      answer(room, 'playerB1', betting ? 'perfect' : 'wrong');
      room.next();
      expect(room.getState().phase).toBe('reveal');
      room.next();
      expect(room.getState().phase).toBe('board');
      room.next();
    }
    expect(room.getState().phase).toBe('podium');
    const players = room.publicState().players;
    const an = players.find((player) => player.name === 'An');
    const binh = players.find((player) => player.name === 'Bình');
    expect(an && binh).toBeTruthy();
    expect(binh!.rank).toBe(1);
    expect(an!.rank).toBe(2);
    expect(binh!.score).toBeGreaterThan(an!.score);
    expect(room.publicState().players.every((player) => player.score >= 0)).toBe(true);
  });

  it('vào lại bằng tên khi mất kết nối thì giữ điểm', () => {
    const { room } = setup();
    room.next();
    answer(room, 'playerA1', 'perfect');
    room.next();
    const score = room.youState('playerA1')!.score;
    expect(score).toBeGreaterThan(0);
    room.disconnect('playerA1');
    room.handleClient({ t: 'join', playerId: 'playerA9', name: 'An', avatar: 'torch' });
    const restored = room.getState().players.find((player) => player.name === 'An');
    expect(restored?.id).toBe('playerA9');
    expect(restored?.score).toBe(score);
    expect(room.youState('playerA9')?.score).toBe(score);
    expect(room.getState().players.filter((player) => foldVi(player.name) === 'an')).toHaveLength(1);
  });

  it('mời ra khỏi phòng thì không vào lại được', () => {
    const { room } = setup();
    room.kick('playerB1');
    const again = room.handleClient({ t: 'join', playerId: 'playerB1', name: 'Bình', avatar: 'lotus' });
    expect(again.kick).toBe(true);
    expect(room.publicState().players.some((player) => player.name === 'Bình')).toBe(false);
  });

  it('tạm dừng thì không nhận đáp án', () => {
    const { room } = setup();
    room.next();
    room.pause();
    const result = room.handleClient({ t: 'timeline', playerId: 'playerA1', order: room.debugKey()!.order! });
    expect(result.error).toBeTruthy();
    expect(room.youState('playerA1')!.submitted).toBe(false);
  });

  it('người vào muộn ở chặng Đổi mới nhận 800 điểm vốn', () => {
    const { room } = setup();
    while (room.getState().phase !== 'podium') {
      if (room.getState().phase === 'intro' && room.publicState().stage?.id === 'doimoi') break;
      if (room.getState().phase === 'intro' || room.getState().phase === 'reveal' || room.getState().phase === 'board' || room.getState().phase === 'lobby') {
        room.next();
      } else if (room.getState().phase === 'play') {
        room.next();
      }
    }
    expect(room.getState().phase).toBe('intro');
    expect(room.getState().showCapitalNote).toBe(true);
    expect(room.youState('playerA1')!.score).toBeGreaterThanOrEqual(800);
    const before = room.youState('playerA1')!.score;
    room.handleClient({ t: 'join', playerId: 'playerC1', name: 'Chi', avatar: 'book' });
    expect(room.youState('playerC1')!.score).toBe(800);
    expect(room.youState('playerA1')!.score).toBe(before);
  });

  it('kết thúc phòng rồi chơi lại giữ người và xoá điểm', () => {
    const { room } = setup();
    room.next();
    const key = room.debugKey();
    room.handleClient({ t: 'timeline', playerId: 'playerA1', order: key!.order! });
    room.finishNow();
    expect(room.getState().phase).toBe('podium');
    expect(room.youState('playerA1')!.score).toBeGreaterThan(0);
    const rev = room.publicState().rev;
    room.replay();
    expect(room.getState().phase).toBe('lobby');
    expect(room.publicState().restarted).toBe(true);
    expect(room.youState('playerA1')!.score).toBe(0);
    expect(room.youState('playerB1')).not.toBeNull();
    expect(room.publicState().rev).toBeGreaterThan(rev);
    room.wipe();
    expect(room.publicState().players).toHaveLength(0);
  });
});
