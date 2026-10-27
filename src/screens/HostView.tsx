import { useEffect, useRef, useState } from 'react';
import { STAGES } from '../data/stages';
import { sounds } from '../audio/sound';
import type { PublicState } from '../game/types';
import { ceremonyStep, remainingMs } from '../ui/clock';
import { Avatar, Grain, StageArt, Star } from '../components/art';
import { MuteButton, TimerRing } from '../components/chrome';
import { Leaderboard } from '../components/Leaderboard';
import { Podium } from '../components/Podium';
import { RevealCard } from '../components/RevealCard';

interface Props {
  pub: PublicState;
  link: string;
  qr: string;
  now: number;
  mode: 'live' | 'solo';
  notice?: string;
  onNext: () => void;
  onPause: () => void;
  onResume: () => void;
  onKick: (playerId: string) => void;
  onSkip: () => void;
  onPerfect?: () => void;
}

function nextLabel(pub: PublicState): string {
  if (pub.phase === 'lobby') return 'Bắt đầu';
  if (pub.phase === 'intro') return 'Vào thử thách';
  if (pub.phase === 'play') return 'Hiện đáp án';
  if (pub.phase === 'reveal') return 'Bảng xếp hạng';
  if (pub.phase === 'board') {
    if (pub.finalNext) return 'Lễ trao thưởng';
    if (pub.stageBreakNext) return 'Sang chặng mới';
    return 'Câu tiếp theo';
  }
  return 'Hiện đầy đủ';
}

export function HostView({ pub, link, qr, now, mode, notice, onNext, onPause, onResume, onKick, onSkip, onPerfect }: Props) {
  const theme = pub.phase === 'podium' ? 'podium' : (pub.stage?.theme ?? 'flame');
  const [confirm, setConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [roster, setRoster] = useState(false);
  const connected = pub.players.filter((player) => player.connected).length;
  const prevConnected = useRef(connected);
  const remain = remainingMs(pub, now);
  const total = (pub.challenge?.timeLimit ?? 0) * 1000;
  const step = ceremonyStep(pub.ceremonyStartedAt, now);
  const prevStep = useRef(0);
  const second = Math.ceil(remain / 1000);

  useEffect(() => {
    if (connected > prevConnected.current) sounds.join();
    prevConnected.current = connected;
  }, [connected]);

  useEffect(() => {
    if (pub.phase === 'play' && second > 0 && second <= 5) sounds.tick();
  }, [second, pub.phase]);

  useEffect(() => {
    if (pub.phase !== 'podium') return;
    if (step >= 1 && prevStep.current < 1) sounds.fanfare();
    if (step >= 3 && prevStep.current < 3) sounds.fanfare();
    prevStep.current = step;
  }, [step, pub.phase]);

  useEffect(() => {
    if (pub.phase === 'board' || pub.phase === 'reveal') sounds.whoosh();
  }, [pub.phase, pub.challengePos]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (event.key === 'n' || event.key === 'N' || event.key === 'ArrowRight') onNext();
      if (event.key === ' ') {
        event.preventDefault();
        if (pub.paused) onResume();
        else onPause();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, onPause, onResume, pub.paused]);

  const sent = pub.players.filter((player) => player.submitted).length;
  const stageIndex = STAGES.findIndex((stage) => stage.id === pub.stage?.id);

  return (
    <div className={`screen theme-${theme} host`} data-testid="phase" data-phase={pub.phase}>
      <Grain />
      <header className="mast">
        <Star className="mast-star" />
        <div>
          <p className="brand">Ngọn Lửa Sử Đảng</p>
          <p className="brand-sub">Lịch sử Đảng Cộng sản Việt Nam</p>
        </div>
        <div className="mast-actions">
          {pub.challengePos >= 0 && pub.phase !== 'podium' && (
            <span className="progress">
              Câu {pub.challengePos + 1}/{pub.challengeCount}
            </span>
          )}
          <MuteButton />
        </div>
      </header>
      <StageArt theme={theme} />
      {notice && <p className="notice">{notice}</p>}
      <main className="host-main">
        {mode === 'solo' && pub.phase === 'lobby' && (
          <section className="intro">
            <p className="eyebrow">Chơi thử</p>
            <h1>Luyện trước khi lên lớp</h1>
            <p className="lead">Màn hình này là máy chiếu. Khung bên cạnh là điện thoại của bạn. Bấm Bắt đầu, rồi trả lời từng câu. Nút «Gợi ý đáp án đúng» chỉ có trong chế độ này.</p>
          </section>
        )}

        {mode === 'live' && pub.phase === 'lobby' && (
          <section className="lobby">
            <div className="qr-card">
              {qr ? <img data-testid="qr-code" src={qr} alt="Mã QR vào phòng" /> : <div className="qr-wait">Đang tạo mã…</div>}
              <p>Quét để vào phòng</p>
            </div>
            <div className="code-block">
              <p className="eyebrow">Mã phòng</p>
              <h1 data-testid="room-code">{pub.code.split('').join(' ')}</h1>
              <p className="link-line">{link}</p>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  void navigator.clipboard?.writeText(link).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  });
                }}
              >
                {copied ? 'Đã chép liên kết' : 'Chép liên kết'}
              </button>
              <p className="fine">Giữ tab này luôn mở. Máy chiếu chính là máy chủ của phòng.</p>
            </div>
            <div className="roster">
              <h2>
                Người chơi <span>{pub.players.length}</span>
              </h2>
              {pub.players.length === 0 && <p className="empty">Đang chờ điện thoại và laptop của lớp…</p>}
              <ul className="player-grid">
                {pub.players.map((player) => (
                  <li key={player.id}>
                    <Avatar id={player.avatar} />
                    <b>{player.name}</b>
                    {confirm === player.id ? (
                      <button type="button" className="kick" onClick={() => { onKick(player.id); setConfirm(null); }}>
                        Mời ra
                      </button>
                    ) : (
                      <button type="button" className="kick ghost" onClick={() => setConfirm(player.id)} aria-label={`Mời ${player.name} ra`}>
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {pub.phase === 'intro' && pub.stage && (
          <section className="intro">
            <p className="eyebrow">{pub.stage.kicker}</p>
            <div className="year-seal">{pub.stage.year}</div>
            <h1>{pub.stage.title}</h1>
            <p className="lead">{pub.stage.blurb}</p>
            {pub.capitalNote && <p className="capital">Mỗi người được cấp thêm 800 điểm vốn. Thứ hạng chưa đổi — hãy cược cho khéo.</p>}
          </section>
        )}

        {pub.phase === 'play' && pub.challenge && (
          <section className="play-host">
            <div className="play-copy">
              <p className="eyebrow">{pub.stage?.kicker}</p>
              {pub.challenge.t === 'bet' && <p className="scenario host-scenario">{pub.challenge.scenario}</p>}
              <h1 data-testid="challenge-prompt">{pub.challenge.t === 'bet' ? pub.challenge.question : pub.challenge.prompt}</h1>
              <p className="fine">Phương án chỉ hiện trên máy người chơi.</p>
              {pub.paused && <p className="pause-flag">Đang tạm dừng</p>}
            </div>
            <TimerRing ms={remain} total={total} />
            <p className="sent" data-testid="submitted-count">
              {sent}/{Math.max(connected, pub.players.length)} đã trả lời
            </p>
            <ul className="mini-roster">
              {pub.players.map((player) => (
                <li key={player.id} className={player.submitted ? 'in' : ''}>
                  <Avatar id={player.avatar} size={36} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {pub.phase === 'reveal' && pub.reveal && <RevealCard reveal={pub.reveal} big />}

        {pub.phase === 'board' && (
          <section>
            <p className="eyebrow">Bảng xếp hạng</p>
            <h1>Ai đang dẫn?</h1>
            <Leaderboard players={pub.players} />
          </section>
        )}

        {pub.phase === 'podium' && <Podium players={pub.players} step={step} />}
      </main>

      <ol className="rail" aria-label="Các chặng">
        {STAGES.map((stage, index) => (
          <li key={stage.id} className={index === stageIndex ? 'on' : index < stageIndex ? 'done' : ''}>
            <b>{stage.year}</b>
            <span>{stage.title}</span>
          </li>
        ))}
      </ol>

      <footer className="host-dock">
        {pub.phase === 'play' && (
          <button type="button" className="btn ghost" onClick={pub.paused ? onResume : onPause}>
            {pub.paused ? 'Tiếp tục' : 'Tạm dừng'}
          </button>
        )}
        {pub.phase !== 'lobby' && (
          <button type="button" className="btn ghost" onClick={() => setRoster((value) => !value)}>
            Người chơi
          </button>
        )}
        {mode === 'solo' && pub.phase === 'play' && onPerfect && (
          <button type="button" className="btn ghost" onClick={onPerfect}>
            Gợi ý đáp án đúng
          </button>
        )}
        {pub.phase === 'podium' && step < 4 ? (
          <button type="button" className="btn btn-red" data-testid="host-next" onClick={onSkip}>
            Hiện đầy đủ
          </button>
        ) : pub.phase === 'podium' ? null : (
          <button type="button" className="btn btn-red" data-testid="host-next" onClick={onNext}>
            {nextLabel(pub)}
          </button>
        )}
      </footer>
      {roster && pub.phase !== 'lobby' && (
        <aside className="drawer">
          <h2>Danh sách lớp</h2>
          <ul>
            {pub.players.map((player) => (
              <li key={player.id}>
                <Avatar id={player.avatar} size={32} />
                <span>{player.name}</span>
                <button type="button" onClick={() => onKick(player.id)}>
                  Mời ra
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
      <p className="keyhint">Phím N: tiếp · Phím cách: tạm dừng</p>
    </div>
  );
}
