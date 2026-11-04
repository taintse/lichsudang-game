import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { makePlayerId, normalizeCode } from '../game/id';
import { sounds } from '../audio/sound';
import { AVATAR_IDS, AVATAR_LABELS, type PublicState, type YouState } from '../game/types';
import { clearIdentity, loadIdentity, saveIdentity, type Identity } from '../net/identity';
import { PlayerClient, type PlayerNet } from '../net/playerClient';
import { Avatar, Grain, Star } from '../components/art';
import { PlayerView, useNow } from './PlayerView';

export function PlayScreen() {
  const params = useParams();
  const preset = normalizeCode(params.code ?? '');
  const [code, setCode] = useState(preset);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string>(AVATAR_IDS[0]);
  const [pub, setPub] = useState<PublicState | null>(null);
  const [you, setYou] = useState<YouState | null>(null);
  const [net, setNet] = useState<PlayerNet>({ status: 'closed', detail: '', debug: '', stalled: false });
  const [toast, setToast] = useState<string | null>(null);
  const [kicked, setKicked] = useState<string | null>(null);
  const [closed, setClosed] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const clientRef = useRef<PlayerClient | null>(null);
  const now = useNow(pub?.serverNow ?? null);

  function connect(identity: Identity) {
    sounds.unlock();
    clientRef.current?.stop();
    saveIdentity(identity);
    const client = new PlayerClient(identity.code, identity, {
      onState: (nextPub, nextYou) => {
        setPub(nextPub);
        setYou(nextYou);
      },
      onKicked: (reason) => {
        setKicked(reason);
        clearIdentity();
      },
      onClosed: (reason) => {
        setClosed(reason);
        clearIdentity();
      },
      onError: (message) => {
        setToast(message);
        window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400);
      },
      onNet: (info) => setNet(info),
    });
    clientRef.current = client;
    client.start();
    setLive(true);
    setKicked(null);
    setClosed(null);
  }

  useEffect(() => {
    const wanted = normalizeCode(params.code ?? '');
    if (wanted) setCode(wanted);
    const saved = loadIdentity();
    if (wanted.length === 4 && saved?.code === wanted) {
      setName(saved.name);
      setAvatar(saved.avatar);
      connect({ ...saved, code: wanted });
    }
    return () => clientRef.current?.stop();
    // connect identity is local; this effect only auto-rejoins a saved player
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.code]);

  if (closed) {
    return (
      <div className="screen theme-flame player">
        <Grain />
        <main className="home-main">
          <h1>Phòng đã đóng</h1>
          <p className="lead">{closed}</p>
          <button
            type="button"
            className="btn btn-red"
            data-testid="join-new"
            onClick={() => {
              setClosed(null);
              setLive(false);
              setPub(null);
              setYou(null);
              setCode('');
              setNet({ status: 'closed', detail: '', debug: '', stalled: false });
            }}
          >
            Nhập mã mới
          </button>
        </main>
      </div>
    );
  }

  if (kicked) {
    return (
      <div className="screen theme-flame player">
        <Grain />
        <main className="home-main">
          <h1>Bạn đã rời phòng</h1>
          <p className="lead">{kicked}</p>
          <Link className="btn btn-red" to="/">
            Về trang chủ
          </Link>
        </main>
      </div>
    );
  }

  if (!live || !pub || !you) {
    return (
      <div className="screen theme-flame player">
        <Grain />
        <header className="mast slim">
          <Star className="mast-star" />
          <div>
            <p className="brand">Vào phòng</p>
            <p className="brand-sub">Ngọn Lửa Sử Đảng</p>
          </div>
        </header>
        <main className="join-main">
          <form
            className="join-card"
            onSubmit={(event) => {
              event.preventDefault();
              const nextCode = normalizeCode(code);
              const clean = name.trim();
              if (nextCode.length !== 4 || clean.length < 1) return;
              const saved = loadIdentity();
              const identity: Identity = {
                playerId: saved?.code === nextCode ? saved.playerId : makePlayerId(),
                name: clean,
                avatar,
                code: nextCode,
              };
              connect(identity);
            }}
          >
            <label>
              Mã phòng
              <input
                data-testid="join-code"
                inputMode="text"
                autoCapitalize="characters"
                value={code}
                maxLength={4}
                placeholder="AB7K"
                onChange={(event) => setCode(normalizeCode(event.target.value))}
              />
            </label>
            <label>
              Tên của bạn
              <input data-testid="join-name" value={name} maxLength={16} placeholder="Ví dụ: Lan" onChange={(event) => setName(event.target.value)} />
            </label>
            <p className="fine">Chọn biểu tượng</p>
            <div className="avatar-grid">
              {AVATAR_IDS.map((id) => (
                <button
                  type="button"
                  key={id}
                  data-testid={`avatar-${id}`}
                  className={avatar === id ? 'avatar-btn on' : 'avatar-btn'}
                  aria-label={AVATAR_LABELS[id]}
                  onClick={() => setAvatar(id)}
                >
                  <Avatar id={id} size={48} />
                  <span>{AVATAR_LABELS[id]}</span>
                </button>
              ))}
            </div>
            <button type="submit" className="btn btn-red" data-testid="join-submit" disabled={normalizeCode(code).length !== 4 || name.trim().length < 1}>
              Vào lớp
            </button>
            {live && <p className="notice">{net.detail || 'Đang nối vào máy chiếu…'}</p>}
            {live && net.debug && (
              <p className="fine" data-testid="net-debug">
                {net.debug}
              </p>
            )}
            {live && net.stalled && (
              <button
                type="button"
                className="btn"
                data-testid="join-retry"
                onClick={() => {
                  const saved = loadIdentity();
                  if (saved) connect(saved);
                }}
              >
                Thử lại
              </button>
            )}
          </form>
        </main>
      </div>
    );
  }

  return (
    <>
      {toast && <p className="toast">{toast}</p>}
      {net.status === 'connecting' && <p className="toast">{[net.detail || 'Đang nối lại…', net.debug].filter(Boolean).join(' · ')}</p>}
      <PlayerView
        pub={pub}
        you={you}
        now={now}
        onTimeline={(order) => clientRef.current?.send({ t: 'timeline', playerId: you.playerId, order })}
        onMap={(choice) => clientRef.current?.send({ t: 'map', playerId: you.playerId, choice })}
        onClue={(text) => clientRef.current?.send({ t: 'clue', playerId: you.playerId, text })}
        onMatch={(leftId, rightId) => clientRef.current?.send({ t: 'match', playerId: you.playerId, leftId, rightId })}
        onBet={(wagerPct, optionId) => clientRef.current?.send({ t: 'bet', playerId: you.playerId, wagerPct, optionId })}
      />
    </>
  );
}
