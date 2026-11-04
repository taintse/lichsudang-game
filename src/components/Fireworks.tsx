import { useEffect, useRef } from 'react';

const COLORS = ['#e23b2f', '#f0c14a', '#fff6e0', '#ffd56a', '#8c1c14', '#ffe7a3', '#fff'];

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  spin: number;
  confetti: boolean;
}

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Projector fireworks. Phones should not mount this. */
export function Fireworks({ mode }: { mode: 'show' | 'burst' | 'grand' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (reducedMotion()) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(mode === 'show' ? 1.25 : 1.5, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = Math.max(1, canvas.clientWidth * dpr);
      canvas.height = Math.max(1, canvas.clientHeight * dpr);
    };
    resize();
    const sparks: Spark[] = [];
    const cap = mode === 'grand' ? 260 : mode === 'show' ? 200 : 120;
    const boom = (x: number, y: number, count: number, speed: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const v = speed * (0.55 + Math.random() * 0.7);
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: 0,
          max: 46 + Math.random() * 28,
          color: COLORS[i % COLORS.length],
          size: (mode === 'grand' ? 3.4 : 2.3) * dpr,
          spin: Math.random() * 6,
          confetti: i % 3 === 0,
        });
      }
      if (sparks.length > cap) sparks.splice(0, sparks.length - cap);
    };
    const width = () => canvas.width;
    const height = () => canvas.height;
    if (mode === 'show') {
      boom(width() * 0.5, height() * 0.38, 46, 3.2 * dpr);
    } else if (mode === 'burst') {
      boom(width() * 0.5, height() * 0.32, 54, 3.6 * dpr);
    } else {
      boom(width() * 0.32, height() * 0.36, 48, 4.2 * dpr);
      boom(width() * 0.68, height() * 0.34, 48, 4.2 * dpr);
      boom(width() * 0.5, height() * 0.28, 72, 5.4 * dpr);
    }
    let frame = 0;
    let raf = 0;
    const draw = () => {
      frame += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mode === 'show' && frame % 28 === 0 && frame < 220) {
        boom(width() * (0.18 + Math.random() * 0.64), height() * (0.18 + Math.random() * 0.28), 28, 2.8 * dpr);
      }
      for (const spark of sparks) {
        spark.life += 1;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.045 * dpr;
        spark.vx *= 0.992;
        spark.spin += 0.12;
        const fade = 1 - spark.life / spark.max;
        if (fade <= 0) continue;
        ctx.globalAlpha = Math.max(0, fade);
        ctx.fillStyle = spark.color;
        ctx.save();
        ctx.translate(spark.x, spark.y);
        ctx.rotate(spark.spin);
        if (spark.confetti) ctx.fillRect(-spark.size, -spark.size * 0.4, spark.size * 2, spark.size * 0.8);
        else ctx.fillRect(-spark.size / 2, -spark.size / 2, spark.size, spark.size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (frame < 280) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [mode]);
  if (reducedMotion()) return null;
  return <canvas ref={ref} className="fireworks" aria-hidden="true" />;
}
