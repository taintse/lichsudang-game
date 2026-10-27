import { LayoutGroup, motion } from 'framer-motion';
import { Avatar } from './art';
import { formatPoints } from '../game/text';
import type { PublicPlayer } from '../game/types';

export function Leaderboard({ players, highlightId, compact = false }: { players: PublicPlayer[]; highlightId?: string; compact?: boolean }) {
  const rows = players.slice().sort((a, b) => a.rank - b.rank);
  const shown = compact ? rows.slice(0, 8) : rows;
  return (
    <LayoutGroup>
      <ol className={compact ? 'board compact' : 'board'} data-testid="leaderboard">
        {shown.map((player) => {
          const climb = player.prevRank - player.rank;
          return (
            <motion.li
              layout
              key={player.id}
              className={player.id === highlightId ? 'me' : ''}
              data-rank={player.rank}
            >
              <span className={`medal m${player.rank <= 3 ? player.rank : 'x'}`}>{player.rank}</span>
              <Avatar id={player.avatar} size={compact ? 36 : 48} />
              <span className="who">
                <strong>{player.name}</strong>
                {!player.connected && <em> mất kết nối</em>}
                {player.combo >= 2 && <em className="combo"> chuỗi {player.combo}</em>}
              </span>
              {climb !== 0 && (
                <span className={climb > 0 ? 'climb up' : 'climb down'}>{climb > 0 ? `▲${climb}` : `▼${-climb}`}</span>
              )}
              <b>{formatPoints(player.score)}</b>
            </motion.li>
          );
        })}
      </ol>
      {compact && rows.length > shown.length && <p className="more">và {rows.length - shown.length} người nữa</p>}
    </LayoutGroup>
  );
}
