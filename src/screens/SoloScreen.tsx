import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameRoom } from '../game/room';
import { submitPerfect } from '../game/perfect';
import { sounds } from '../audio/sound';
import { AVATAR_IDS, AVATAR_LABELS } from '../game/types';
import { cleanName } from '../game/text';
import { Avatar, Grain, Star } from '../components/art';
import { HostView } from './HostView';
import { PlayerView, useNow } from './PlayerView';

const PLAYER_ID = 'soloplus01';

export function SoloScreen() {
  const nav = useNavigate();
  const roomRef = useRef<GameRoom | null>(null);
  const [version, setVersion] = useState(0);
  const [name, setName] = useState('Bạn');
  const [avatar, setAvatar] = useState<string>(AVATAR_IDS[0]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'host' | 'play'>('play');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const room = new GameRoom({ code: 'THU' });
    roomRef.current = room;
    setVersion(1);
    return room.subscribe(() => setVersion((value) => value + 1));
  }, []);

  const room = roomRef.current;
  void version;
  const now = useNow(room ? room.publicState().serverNow : null);
  if (!room) return null;

  if (!ready) {
    return (
      <div className="screen theme-flame player">
        <Grain />
        <header className="mast slim">
          <Star className="mast-star" />
          <div>
            <p className="brand">Chơi thử</p>
            <p className="brand-sub">Một mình, đủ 5 chặng</p>
          </div>
        </header>
        <main className="join-main">
          <form
            className="join-card"
            onSubmit={(event) => {
              event.preventDefault();
              const cleaned = cleanName(name);
              if (!cleaned) {
                setError('Tên chưa dùng được.');
                return;
              }
              sounds.unlock();
              room.handleClient({ t: 'join', playerId: PLAYER_ID, name: cleaned, avatar });
              setReady(true);
            }}
          >
            <label>
              Tên của bạn
              <input value={name} maxLength={16} onChange={(event) => setName(event.target.value)} />
            </label>
            <div className="avatar-grid">
              {AVATAR_IDS.map((id) => (
                <button type="button" key={id} className={avatar === id ? 'avatar-btn on' : 'avatar-btn'} onClick={() => setAvatar(id)}>
                  <Avatar id={id} size={48} />
                  <span>{AVATAR_LABELS[id]}</span>
                </button>
              ))}
            </div>
            {error && <p className="bad-note">{error}</p>}
            <button type="submit" className="btn btn-red">
              Bắt đầu chơi thử
            </button>
          </form>
        </main>
      </div>
    );
  }

  const pub = room.publicState();
  const you = room.youState(PLAYER_ID);
  if (!you) return null;

  return (
    <div className={`solo-app tab-${tab}`}>
      <div className="solo-switch">
        <button type="button" className={tab === 'host' ? 'on' : ''} onClick={() => setTab('host')}>
          Máy chiếu
        </button>
        <button type="button" className={tab === 'play' ? 'on' : ''} onClick={() => setTab('play')}>
          Người chơi
        </button>
        <span>Chơi thử</span>
      </div>
      <div className="solo-grid">
        <HostView
          pub={pub}
          link="Chế độ chơi thử không dùng mã phòng"
          qr=""
          now={now}
          mode="solo"
          onNext={() => {
            sounds.unlock();
            room.next();
          }}
          onPause={() => room.pause()}
          onResume={() => room.resume()}
          onKick={(playerId) => room.kick(playerId)}
          onSkip={() => room.skipCeremony()}
          onPerfect={() => submitPerfect(room, PLAYER_ID)}
          onReplay={() => room.replay()}
          onFinish={() => room.finishNow()}
          onNewRoom={() => {
            room.wipe();
            setReady(false);
          }}
          onHome={() => nav('/')}
        />
        <div className="phone-shell">
          <PlayerView
            pub={pub}
            you={you}
            now={now}
            onTimeline={(order) => room.handleClient({ t: 'timeline', playerId: PLAYER_ID, order })}
            onMap={(point) => room.handleClient({ t: 'map', playerId: PLAYER_ID, x: point.x, y: point.y })}
            onClue={(text) => room.handleClient({ t: 'clue', playerId: PLAYER_ID, text })}
            onMatch={(leftId, rightId) => room.handleClient({ t: 'match', playerId: PLAYER_ID, leftId, rightId })}
            onBet={(wagerPct, optionId) => room.handleClient({ t: 'bet', playerId: PLAYER_ID, wagerPct, optionId })}
          />
        </div>
      </div>
    </div>
  );
}
