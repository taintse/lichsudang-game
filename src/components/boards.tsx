import { useEffect, useRef, useState } from 'react';
import { foldVi } from '../game/text';
import type { PublicChallenge, YouState } from '../game/types';
import { formatPoints } from '../game/text';
import { VietnamMap } from './VietnamMap';

interface Common {
  you: YouState;
  locked: boolean;
}

export function TimelineBoard({
  challenge,
  you,
  locked,
  onSubmit,
}: Common & { challenge: Extract<PublicChallenge, { t: 'timeline' }>; onSubmit: (order: string[]) => void }) {
  const [order, setOrder] = useState(challenge.items);
  const dragId = useRef<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => setOrder(challenge.items), [challenge.id]);
  const done = you.submitted || locked;

  function move(id: string, dir: -1 | 1) {
    setOrder((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      const next = index + dir;
      if (index < 0 || next < 0 || next >= prev.length) return prev;
      const copy = prev.slice();
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  }

  function reorder(id: string, clientY: number) {
    const list = listRef.current;
    if (!list) return;
    const rows = [...list.querySelectorAll<HTMLElement>('[data-item-id]')];
    let target = rows.length;
    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        target = i;
        break;
      }
    }
    setOrder((prev) => {
      const from = prev.findIndex((item) => item.id === id);
      if (from < 0) return prev;
      let to = target;
      if (from < to) to -= 1;
      if (from === to) return prev;
      const copy = prev.slice();
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  }

  return (
    <div className="board-play">
      <ul
        className="timeline"
        ref={listRef}
        onPointerDown={(event) => {
          if (done) return;
          const row = (event.target as HTMLElement).closest<HTMLElement>('[data-item-id]');
          if (!row || (event.target as HTMLElement).closest('button')) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragId.current = row.dataset.itemId ?? null;
        }}
        onPointerMove={(event) => {
          if (!dragId.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
          reorder(dragId.current, event.clientY);
        }}
        onPointerUp={() => {
          dragId.current = null;
        }}
        onPointerCancel={() => {
          dragId.current = null;
        }}
      >
        {order.map((item, index) => (
          <li
            key={item.id}
            data-item-id={item.id}
            data-testid={`item-${item.id}`}
            className={dragId.current === item.id ? 'dragging' : ''}
          >
            <span className="ord">{index + 1}</span>
            <p>{item.text}</p>
            <span className="nudges">
              <button type="button" data-testid={`up-${item.id}`} disabled={done || index === 0} onClick={() => move(item.id, -1)} aria-label="Đưa lên">
                ▲
              </button>
              <button type="button" data-testid={`down-${item.id}`} disabled={done || index === order.length - 1} onClick={() => move(item.id, 1)} aria-label="Đưa xuống">
                ▼
              </button>
            </span>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-red" data-testid="timeline-lock" disabled={done} onClick={() => onSubmit(order.map((item) => item.id))}>
        {you.submitted ? 'Đã chốt thứ tự' : 'Chốt thứ tự'}
      </button>
    </div>
  );
}

export function MapBoard({
  challenge,
  you,
  locked,
  onSubmit,
}: Common & { challenge: Extract<PublicChallenge, { t: 'map' }>; onSubmit: (choice: string) => void }) {
  const [choice, setChoice] = useState<string | null>(you.mapChoice);
  const selected = you.mapChoice ?? choice;
  const done = you.submitted || locked;
  return (
    <div className="board-play">
      <VietnamMap
        markers={challenge.markers.map((marker) => ({ ...marker, selected: marker.id === selected }))}
        onSelect={done ? undefined : setChoice}
      />
      <button type="button" className="btn btn-red" data-testid="map-lock" disabled={done || !selected} onClick={() => selected && onSubmit(selected)}>
        {you.submitted ? 'Đã chốt vị trí' : 'Chốt vị trí'}
      </button>
    </div>
  );
}

export function ClueBoard({
  challenge,
  you,
  locked,
  elapsed,
  onSubmit,
}: Common & { challenge: Extract<PublicChallenge, { t: 'clues' }>; elapsed: number; onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');
  const rejected = new Set(you.rejected);
  const visible = challenge.clues.filter((clue) => clue.revealAt * 1000 <= elapsed);
  return (
    <div className="board-play">
      <ol className="clues">
        {visible.map((clue) => (
          <li key={clue.revealAt}>{clue.text}</li>
        ))}
      </ol>
      {visible.length < challenge.clues.length && <p className="hint">Manh mối tiếp theo sắp hiện…</p>}
      <div className="options">
        {challenge.options.map((option) => (
          <button
            type="button"
            key={option}
            className="opt"
            data-testid="clue-option"
            disabled={locked || you.solved || rejected.has(foldVi(option))}
            onClick={() => onSubmit(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <form
        className="typed"
        onSubmit={(event) => {
          event.preventDefault();
          if (!text.trim() || locked || you.solved) return;
          onSubmit(text.trim());
          setText('');
        }}
      >
        <input
          data-testid="clue-input"
          value={text}
          disabled={locked || you.solved}
          placeholder="Hoặc gõ đáp án"
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" className="btn" data-testid="clue-send" disabled={locked || you.solved || text.trim().length < 2}>
          Đoán
        </button>
      </form>
      {you.solved && <p className="good-note">Đã đúng. Điểm sẽ công bố khi mở đáp án.</p>}
      {you.wrongGuesses > 0 && !you.solved && <p className="bad-note">Đoán sai {you.wrongGuesses} lần — mỗi lần bị trừ khi tổng kết.</p>}
    </div>
  );
}

export function MatchBoard({
  challenge,
  you,
  locked,
  onPair,
}: Common & { challenge: Extract<PublicChallenge, { t: 'match' }>; onPair: (leftId: string, rightId: string) => void }) {
  const [leftId, setLeftId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const matchedLeft = new Set(you.matchedPairs.map((pair) => pair.leftId));
  const matchedRight = new Set(you.matchedPairs.map((pair) => pair.rightId));
  useEffect(() => {
    setBusy(false);
    if (!you.submitted) setLeftId(null);
  }, [you.mistakeSeq, you.matchedPairs.length, you.submitted]);
  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => setBusy(false), 1200);
    return () => window.clearTimeout(timer);
  }, [busy]);

  return (
    <div className={`board-play match ${you.mistakeSeq ? 'shake' : ''}`} data-mistakes={you.mistakeSeq}>
      <div className="cols">
        <div>
          <p className="col-title">Sự kiện</p>
          {challenge.left.map((item) => (
            <button
              type="button"
              key={item.id}
              data-testid={`match-left-${item.id}`}
              className={matchedLeft.has(item.id) ? 'tile locked' : leftId === item.id ? 'tile on' : 'tile'}
              disabled={locked || matchedLeft.has(item.id)}
              onClick={() => setLeftId(item.id)}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div>
          <p className="col-title">Năm / ý nghĩa</p>
          {challenge.right.map((item) => (
            <button
              type="button"
              key={item.id}
              data-testid={`match-right-${item.id}`}
              className={matchedRight.has(item.id) ? 'tile locked' : 'tile'}
              disabled={locked || busy || !leftId || matchedRight.has(item.id)}
              onClick={() => {
                if (!leftId) return;
                setBusy(true);
                onPair(leftId, item.id);
              }}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
      <p className="hint">
        Đã khớp {you.matchedPairs.length}/{challenge.left.length}
        {you.mistakeSeq > 0 ? ` · sai ${you.mistakeSeq}` : ''}
      </p>
    </div>
  );
}

const WAGERS = [
  { pct: 0, label: 'Giữ điểm' },
  { pct: 10, label: '10%' },
  { pct: 25, label: '25%' },
  { pct: 50, label: '50%' },
  { pct: 100, label: 'Tất tay' },
] as const;

export function BetBoard({
  challenge,
  you,
  locked,
  onSubmit,
}: Common & { challenge: Extract<PublicChallenge, { t: 'bet' }>; onSubmit: (pct: number, optionId: string) => void }) {
  const [pct, setPct] = useState<number | null>(null);
  const [optionId, setOptionId] = useState<string | null>(null);
  const wager = pct == null ? 0 : Math.round((you.score * pct) / 100);
  const done = you.submitted || locked;
  return (
    <div className="board-play">
      <p className="scenario">{challenge.scenario}</p>
      <p className="bank">
        Điểm đang có: <strong>{formatPoints(you.score)}</strong>
      </p>
      <div className="wagers">
        {WAGERS.map((chip) => (
          <button
            type="button"
            key={chip.pct}
            data-testid={`bet-pct-${chip.pct}`}
            className={pct === chip.pct ? 'chip on' : 'chip'}
            disabled={done}
            onClick={() => setPct(chip.pct)}
          >
            {chip.label}
          </button>
        ))}
      </div>
      {pct === 100 && <p className="bad-note">Tất tay: sai là mất hết điểm đang có.</p>}
      <div className="options">
        {challenge.options.map((option) => (
          <button
            type="button"
            key={option.id}
            data-testid={`bet-option-${option.id}`}
            className={optionId === option.id ? 'opt on' : 'opt'}
            disabled={done}
            onClick={() => setOptionId(option.id)}
          >
            {option.text}
          </button>
        ))}
      </div>
      <p className="hint">
        {pct == null || !optionId
          ? 'Chọn mức cược và một phương án.'
          : `Đúng: +${formatPoints(wager)} và thưởng tốc độ · Sai: −${formatPoints(wager)}`}
      </p>
      <button
        type="button"
        className="btn btn-red"
        data-testid="bet-lock"
        disabled={done || pct == null || !optionId}
        onClick={() => pct != null && optionId && onSubmit(pct, optionId)}
      >
        {you.submitted ? 'Đã chốt cược' : 'Chốt cược'}
      </button>
    </div>
  );
}
