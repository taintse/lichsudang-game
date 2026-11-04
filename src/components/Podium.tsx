import { Avatar } from './art';
import { formatPoints } from '../game/text';
import type { PublicPlayer } from '../game/types';
import { topTen } from './RankShow';

const NEED: Record<number, number> = { 3: 1, 2: 2, 1: 3 };

export function Podium({ players, step, youId }: { players: PublicPlayer[]; step: number; youId?: string }) {
  const ranked = players.slice().sort((a, b) => a.rank - b.rank);
  const slots = [
    { place: 2, player: ranked[1] },
    { place: 1, player: ranked[0] },
    { place: 3, player: ranked[2] },
  ];
  return (
    <div className="podium-wrap" data-testid="podium">
      <p className="eyebrow">Lễ trao thưởng</p>
      <h2>Bục vinh quang</h2>
      {ranked.length === 0 && <p className="wait-line">Chưa có người chơi trên bục.</p>}
      <div className="podium">
        {slots.map((slot) => {
          const shown = step >= NEED[slot.place];
          const spot = step === NEED[slot.place];
          return (
            <div key={slot.place} className={`pedestal p${slot.place} ${shown ? 'lit' : 'dim'} ${spot ? 'spot' : ''}`} data-testid={`podium-slot-${slot.place}`}>
              <div className="winner">
                {shown && slot.player ? (
                  <>
                    <Avatar id={slot.player.avatar} size={slot.place === 1 ? 72 : 56} />
                    <strong data-testid={`podium-name-${slot.place}`}>{slot.player.name}</strong>
                    <em>{formatPoints(slot.player.score)}</em>
                  </>
                ) : (
                  <span className="empty-slot" data-testid={shown ? `podium-empty-${slot.place}` : undefined}>
                    {shown ? 'Trống' : '…'}
                  </span>
                )}
              </div>
              <div className="block">
                <span>{slot.place}</span>
              </div>
            </div>
          );
        })}
      </div>
      {youId && step >= 1 && <YouLine players={ranked} youId={youId} />}
      {step >= 4 && (
        <>
          <ol className="final-list">
            {topTen(ranked).map((player) => (
              <li key={player.id} className={`${player.id === youId ? 'me' : ''} ${player.rank <= 3 ? `prize rank-${player.rank}` : ''}`}>
                <span>{player.rank}</span>
                <Avatar id={player.avatar} size={32} />
                <b>{player.name}</b>
                <em>{formatPoints(player.score)}</em>
              </li>
            ))}
          </ol>
          <p className="tie-rule">Hòa điểm: người có tổng thời gian trả lời ngắn hơn xếp trên. Nếu vẫn hòa, người vào phòng trước xếp trên. Hạng nhất, nhì, ba nhận giải.</p>
        </>
      )}
    </div>
  );
}

function YouLine({ players, youId }: { players: PublicPlayer[]; youId: string }) {
  const you = players.find((player) => player.id === youId);
  if (!you) return null;
  const label = you.rank === 1 ? 'Nhất! Lên nhận thưởng.' : you.rank === 2 ? 'Nhì! Lên nhận thưởng.' : you.rank === 3 ? 'Ba! Lên nhận thưởng.' : `Bạn hạng ${you.rank}.`;
  return (
    <p className="you-line">
      {label} · {formatPoints(you.score)} điểm
    </p>
  );
}
