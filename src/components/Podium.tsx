import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar } from './art';
import { formatPoints } from '../game/text';
import type { PublicPlayer } from '../game/types';

function Burst({ token }: { token: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    const colors = ['#e23b2f', '#f0c14a', '#fff6e0', '#1f7a45', '#8c1c14', '#ffe7a3'];
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: -Math.random() * 0.3,
      r: 4 + Math.random() * 7,
      v: 0.15 + Math.random() * 0.45,
      w: (Math.random() - 0.5) * 0.2,
      c: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 6,
    }));
    let frame = 0;
    let raf = 0;
    const draw = () => {
      frame += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const piece of pieces) {
        piece.y += piece.v * 0.008;
        piece.x += piece.w * 0.01;
        piece.tilt += 0.08;
        const x = piece.x * canvas.width;
        const y = piece.y * canvas.height;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(piece.tilt);
        ctx.fillStyle = piece.c;
        ctx.fillRect(-piece.r, -piece.r / 2, piece.r * 2, piece.r);
        ctx.restore();
      }
      if (frame < 220) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [token]);
  return <canvas ref={ref} className="confetti" aria-hidden="true" />;
}

export function Podium({ players, step, youId }: { players: PublicPlayer[]; step: number; youId?: string }) {
  const ranked = players.slice().sort((a, b) => a.rank - b.rank);
  const slots = [
    { place: 2, player: ranked[1], show: step >= 2 },
    { place: 1, player: ranked[0], show: step >= 3 },
    { place: 3, player: ranked[2], show: step >= 1 },
  ];
  return (
    <div className="podium-wrap" data-testid="podium">
      {step >= 1 && <Burst token={step} />}
      <p className="eyebrow">Lễ trao thưởng</p>
      <h2>Bục vinh quang</h2>
      {step === 0 && <p className="wait-line">Xin giữ yên lặng một nhịp…</p>}
      <div className="podium">
        {slots.map((slot) => (
          <div key={slot.place} className={`pedestal p${slot.place}`}>
            <AnimatePresence>
              {slot.show && slot.player && (
                <motion.div
                  className="winner"
                  initial={{ y: 40, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                >
                  <Avatar id={slot.player.avatar} size={slot.place === 1 ? 84 : 64} />
                  <strong>{slot.player.name}</strong>
                  <em>{formatPoints(slot.player.score)}</em>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="block">
              <span>{slot.place}</span>
            </div>
          </div>
        ))}
      </div>
      {youId && step >= 3 && <YouLine players={ranked} youId={youId} />}
      {step >= 4 && (
        <ol className="final-list">
          {ranked.map((player) => (
            <li key={player.id} className={player.id === youId ? 'me' : ''}>
              <span>{player.rank}</span>
              <Avatar id={player.avatar} size={32} />
              <b>{player.name}</b>
              <em>{formatPoints(player.score)}</em>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function YouLine({ players, youId }: { players: PublicPlayer[]; youId: string }) {
  const you = players.find((player) => player.id === youId);
  if (!you) return null;
  const label = you.rank === 1 ? 'Nhất! Lên nhận thưởng.' : you.rank === 2 ? 'Nhì! Lên nhận thưởng.' : you.rank === 3 ? 'Ba! Lên nhận thưởng.' : `Bạn hạng ${you.rank}. Cảm ơn đã vào lửa cùng lớp.`;
  return (
    <p className="you-line" data-testid="final-rank">
      {label} · {formatPoints(you.score)} điểm
    </p>
  );
}
