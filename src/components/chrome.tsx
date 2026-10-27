import { useSyncExternalStore } from 'react';
import { sounds } from '../audio/sound';

export function MuteButton() {
  const muted = useSyncExternalStore(sounds.subscribe, sounds.getMuted, () => false);
  return (
    <button type="button" className="mute" aria-pressed={muted} onClick={() => sounds.toggle()}>
      {muted ? 'Bật tiếng' : 'Tắt tiếng'}
    </button>
  );
}

export function TimerRing({ ms, total }: { ms: number; total: number }) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const ratio = total <= 0 ? 0 : Math.max(0, Math.min(1, ms / total));
  return (
    <div className={seconds <= 5 && ms > 0 ? 'timer hot' : 'timer'} data-testid="timer" aria-live="polite">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="track" cx="50" cy="50" r={radius} />
        <circle className="value" cx="50" cy="50" r={radius} strokeDasharray={`${circ * ratio} ${circ}`} />
      </svg>
      <strong>{seconds}</strong>
    </div>
  );
}

export function Boot({ label = 'Đang mở…', onRetry }: { label?: string; onRetry?: () => void }) {
  return (
    <div className="screen theme-flame boot">
      <p>{label}</p>
      {onRetry && (
        <button type="button" className="btn btn-red" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
