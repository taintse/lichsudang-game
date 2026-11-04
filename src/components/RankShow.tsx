import { useEffect, useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import type { PublicPlayer } from '../game/types';
import { formatPoints } from '../game/text';
import { sounds } from '../audio/sound';
import { Avatar } from './art';

function CountUp({ from, to, play }: { from: number; to: number; play: boolean }) {
  const [value, setValue] = useState(play ? from : to);
  useEffect(() => {
    if (!play) {
      setValue(to);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      setValue(Math.round(from + (to - from) * (1 - (1 - t) * (1 - t))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, play]);
  return <>{formatPoints(value)}</>;
}

export function topTen(players: PublicPlayer[]): PublicPlayer[] {
  return players.slice().sort((a, b) => a.rank - b.rank).slice(0, 10);
}

/** Animated top 10. Rows start in the previous order, then slide to the new one. */
export function RankShow({ players, prize = false }: { players: PublicPlayer[]; prize?: boolean }) {
  const rows = topTen(players);
  const [live, setLive] = useState(false);
  useEffect(() => {
    sounds.drumroll();
    const id = window.setTimeout(() => {
      setLive(true);
      sounds.whoosh();
    }, 700);
    return () => window.clearTimeout(id);
  }, [players.map((player) => `${player.id}:${player.rank}:${player.score}`).join('|')]);

  const ordered = rows.slice().sort((a, b) => (live ? a.rank - b.rank : a.prevRank - b.prevRank || a.rank - b.rank));

  return (
    <div data-testid="top10">
      <LayoutGroup>
        <ol className="board top10">
          {ordered.map((player, index) => {
            const climb = player.prevRank - player.rank;
            const fresh = player.prevRank > 10 && player.rank <= 10;
            return (
              <motion.li
                layout
                key={player.id}
                className={`${player.rank <= 3 && prize ? 'prize' : ''} ${fresh ? 'fresh' : ''}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, layout: { duration: 0.55 } }}
              >
                <span className={`medal m${player.rank <= 3 ? player.rank : 'x'}`}>{player.rank}</span>
                <Avatar id={player.avatar} size={44} />
                <span className="who">
                  <strong>{player.name}</strong>
                  {fresh && <em className="fresh-tag"> mới vào top 10</em>}
                  {player.combo >= 2 && <em className="combo"> chuỗi {player.combo}</em>}
                </span>
                {climb !== 0 && <span className={climb > 0 ? 'climb up' : 'climb down'}>{climb > 0 ? `↑${climb}` : `↓${-climb}`}</span>}
                <b>
                  <CountUp from={player.prevScore} to={player.score} play={live} />
                </b>
              </motion.li>
            );
          })}
        </ol>
      </LayoutGroup>
      {rows.length === 0 && <p className="wait-line">Chưa có người trong bảng.</p>}
      <p className="tie-rule">Hòa điểm: người có tổng thời gian trả lời ngắn hơn xếp trên. Nếu vẫn hòa, người vào phòng trước xếp trên.</p>
    </div>
  );
}
