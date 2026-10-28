import { useEffect, useRef, useState } from 'react';
import { STAGES } from '../data/stages';
import { sounds } from '../audio/sound';
import type { PublicChallenge, PublicState, YouState } from '../game/types';
import { formatPoints } from '../game/text';
import { ceremonyStep, elapsedMs, remainingMs } from '../ui/clock';
import { Avatar, Grain, Star } from '../components/art';
import { MuteButton, TimerRing } from '../components/chrome';
import { BetBoard, ClueBoard, MapBoard, MatchBoard, TimelineBoard } from '../components/boards';
import { Leaderboard } from '../components/Leaderboard';
import { Podium } from '../components/Podium';
import { RevealCard } from '../components/RevealCard';

interface Props {
  pub: PublicState;
  you: YouState;
  now: number;
  onTimeline: (order: string[]) => void;
  onMap: (choice: string) => void;
  onClue: (text: string) => void;
  onMatch: (leftId: string, rightId: string) => void;
  onBet: (pct: number, optionId: string) => void;
}

function useResultSound(pub: PublicState, you: YouState) {
  const token = you.lastResult && pub.phase === 'reveal' ? `${pub.challengePos}:${you.lastResult.delta}:${you.lastResult.correct}` : '';
  useEffect(() => {
    if (!token || !you.lastResult) return;
    if (you.lastResult.correct) {
      sounds.correct();
      if (you.combo >= 2) sounds.combo();
    } else if (you.lastResult.delta <= 0) sounds.wrong();
  }, [token, you.combo, you.lastResult]);
}

export function PlayerView({ pub, you, now, onTimeline, onMap, onClue, onMatch, onBet }: Props) {
  const theme = pub.phase === 'podium' ? 'podium' : (pub.stage?.theme ?? 'flame');
  const remain = remainingMs(pub, now);
  const elapsed = elapsedMs(pub, now);
  const total = (pub.challenge?.timeLimit ?? 0) * 1000;
  const locked = pub.paused || (pub.phase === 'play' && remain <= 0);
  const second = Math.ceil(remain / 1000);
  useResultSound(pub, you);
  useEffect(() => {
    if (pub.phase === 'play' && second > 0 && second <= 5) sounds.tick();
  }, [second, pub.phase]);

  return (
    <div className={`screen theme-${theme} player`} data-phase={pub.phase}>
      <Grain />
      <header className="mast slim">
        <Star className="mast-star" />
        <div>
          <p className="brand">Ngọn Lửa Sử Đảng</p>
          <p className="brand-sub">Phòng {pub.code}</p>
        </div>
        <MuteButton />
      </header>
      <div className="you-bar">
        <Avatar id={you.avatar} size={42} />
        <div>
          <strong>{you.name}</strong>
          <span>Hạng {you.rank}</span>
        </div>
        <b data-testid="player-score">{formatPoints(you.score)}</b>
        {you.combo >= 2 && (
          <em className="combo-pill" data-testid="player-combo">
            Chuỗi {you.combo}
          </em>
        )}
      </div>
      <main className="player-main">
        {pub.phase === 'lobby' && (
          <section className="wait-card">
            <h1>{pub.restarted ? 'Ván mới' : 'Đã vào lớp'}</h1>
            <p>
              {pub.restarted
                ? 'Điểm đã về không. Giữ máy này, giảng viên sắp bắt đầu lại với đúng những người trong phòng.'
                : 'Giữ máy này. Khi giảng viên bấm bắt đầu, câu hỏi sẽ hiện ngay tại đây.'}
            </p>
            <p className="count">{pub.players.length} người trong phòng</p>
            <ul className="name-list">
              {pub.players.map((player) => (
                <li key={player.id}>
                  <Avatar id={player.avatar} size={28} /> {player.name}
                </li>
              ))}
            </ul>
          </section>
        )}
        {pub.phase === 'intro' && pub.stage && (
          <section className="intro compact">
            <p className="eyebrow">{pub.stage.kicker}</p>
            <div className="year-seal">{pub.stage.year}</div>
            <h1>{pub.stage.title}</h1>
            <p className="lead">{pub.stage.blurb}</p>
            {pub.capitalNote && <p className="capital">Bạn được cấp thêm 800 điểm vốn để mang ra cược.</p>}
          </section>
        )}
        {pub.phase === 'play' && pub.challenge && (
          <section>
            <div className="play-top">
              <p className="eyebrow">
                Câu {pub.challengePos + 1}/{pub.challengeCount}
              </p>
              <TimerRing ms={remain} total={total} />
            </div>
            <h1 className="q" data-testid="challenge-prompt">
              {pub.challenge.t === 'bet' ? pub.challenge.question : pub.challenge.prompt}
            </h1>
            <p className="howto">{pub.challenge.howTo}</p>
            {pub.paused && <p className="pause-flag">Giảng viên đang tạm dừng</p>}
            <PlaySwitch
              key={pub.challenge.id}
              challenge={pub.challenge}
              you={you}
              locked={locked}
              elapsed={elapsed}
              onTimeline={onTimeline}
              onMap={onMap}
              onClue={onClue}
              onMatch={onMatch}
              onBet={onBet}
            />
          </section>
        )}
        {pub.phase === 'reveal' && pub.reveal && <RevealCard reveal={pub.reveal} you={you} />}
        {pub.phase === 'board' && (
          <section>
            {you.lastResult && (
              <p className={you.lastResult.delta > 0 ? 'delta good' : 'delta'}>
                {you.lastResult.delta > 0 ? `+${formatPoints(you.lastResult.delta)}` : formatPoints(you.lastResult.delta)} · {you.lastResult.note}
              </p>
            )}
            <h1>Hạng {you.rank}</h1>
            <Leaderboard players={pub.players} highlightId={you.playerId} compact />
          </section>
        )}
        {pub.phase === 'podium' && (
          <>
            <Podium players={pub.players} step={ceremonyStep(pub.ceremonyStartedAt, now)} youId={you.playerId} />
            <p className="wait-line">Giữ máy này. Khi giảng viên chơi lại, ván mới hiện ngay tại đây.</p>
          </>
        )}
      </main>
      <ol className="rail slim-rail">
        {STAGES.map((stage) => (
          <li key={stage.id} className={stage.id === pub.stage?.id ? 'on' : ''}>
            {stage.year}
          </li>
        ))}
      </ol>
    </div>
  );
}

function PlaySwitch(props: {
  challenge: PublicChallenge;
  you: YouState;
  locked: boolean;
  elapsed: number;
  onTimeline: (order: string[]) => void;
  onMap: (choice: string) => void;
  onClue: (text: string) => void;
  onMatch: (leftId: string, rightId: string) => void;
  onBet: (pct: number, optionId: string) => void;
}) {
  const { challenge, you, locked } = props;
  if (challenge.t === 'timeline') return <TimelineBoard challenge={challenge} you={you} locked={locked} onSubmit={props.onTimeline} />;
  if (challenge.t === 'map') return <MapBoard challenge={challenge} you={you} locked={locked} onSubmit={props.onMap} />;
  if (challenge.t === 'clues') return <ClueBoard challenge={challenge} you={you} locked={locked} elapsed={props.elapsed} onSubmit={props.onClue} />;
  if (challenge.t === 'match') return <MatchBoard challenge={challenge} you={you} locked={locked} onPair={props.onMatch} />;
  return <BetBoard challenge={challenge} you={you} locked={locked} onSubmit={props.onBet} />;
}

export function useNow(serverNow: number | null) {
  const anchor = useRef({ serverNow: serverNow ?? Date.now(), at: Date.now() });
  if (serverNow != null && serverNow !== anchor.current.serverNow) {
    anchor.current = { serverNow, at: Date.now() };
  }
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 100);
    return () => window.clearInterval(id);
  }, []);
  if (serverNow == null) return Date.now();
  return anchor.current.serverNow + (Date.now() - anchor.current.at);
}
