import { useEffect, useRef, useState } from 'react';
import { foldVi } from '../game/text';
import type { PublicChallenge, YouState } from '../game/types';
import { formatPoints } from '../game/text';
import { VietnamMap } from './VietnamMap';

interface Common {
  you: YouState;
  locked: boolean;
}

function SaveHint({ done }: { done: boolean }) {
  return <p className="hint">{done ? 'Đã chốt. Điểm tốc độ tính từ lúc này.' : 'Đã lưu. Chốt nếu xong sớm để lấy điểm tốc độ.'}</p>;
}

export function TimelineBoard({
  challenge,
  you,
  locked,
  onSubmit,
  onLock,
}: Common & { challenge: Extract<PublicChallenge, { t: 'timeline' }>; onSubmit: (order: string[]) => void; onLock: () => void }) {
  const [order, setOrder] = useState(challenge.items);
  const orderRef = useRef(challenge.items);
  const dragId = useRef<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const draftTimer = useRef<number | null>(null);
  useEffect(() => {
    orderRef.current = challenge.items;
    setOrder(challenge.items);
  }, [challenge.id]);
  const done = you.submitted || locked;

  function publish(next: typeof order, immediate: boolean) {
    orderRef.current = next;
    setOrder(next);
    if (draftTimer.current) window.clearTimeout(draftTimer.current);
    const ids = next.map((item) => item.id);
    if (immediate) onSubmit(ids);
    else draftTimer.current = window.setTimeout(() => onSubmit(ids), 200);
  }

  function move(id: string, dir: -1 | 1) {
    const prev = orderRef.current;
    const index = prev.findIndex((item) => item.id === id);
    const nextIndex = index + dir;
    if (index < 0 || nextIndex < 0 || nextIndex >= prev.length) return;
    const copy = prev.slice();
    const [item] = copy.splice(index, 1);
    copy.splice(nextIndex, 0, item);
    publish(copy, true);
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
    const prev = orderRef.current;
    const from = prev.findIndex((item) => item.id === id);
    if (from < 0) return;
    let to = target;
    if (from < to) to -= 1;
    if (from === to) return;
    const copy = prev.slice();
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    publish(copy, false);
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
          if (draftTimer.current) {
            window.clearTimeout(draftTimer.current);
            onSubmit(orderRef.current.map((item) => item.id));
          }
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
            tabIndex={done ? -1 : 0}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                move(item.id, -1);
              }
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                move(item.id, 1);
              }
            }}
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
      <SaveHint done={you.submitted} />
      <button
        type="button"
        className="btn btn-red"
        data-testid="timeline-lock"
        disabled={done}
        onClick={() => {
          onSubmit(orderRef.current.map((item) => item.id));
          onLock();
        }}
      >
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
  onLock,
}: Common & { challenge: Extract<PublicChallenge, { t: 'match' }>; onPair: (leftId: string, rightId: string) => void; onLock: () => void }) {
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
      <SaveHint done={you.submitted} />
      <button type="button" className="btn btn-red" data-testid="match-lock" disabled={locked || you.submitted} onClick={onLock}>
        {you.submitted ? 'Đã chốt' : 'Chốt cặp'}
      </button>
    </div>
  );
}

const WAGER_CHIPS = [
  { pct: 25, label: '25%' },
  { pct: 50, label: '50%' },
  { pct: 100, label: 'Tất tay' },
] as const;

export function WagerBoard({ you, onPick }: { you: YouState; onPick: (pct: number) => void }) {
  const [pct, setPct] = useState(you.wagerPct ?? 25);
  const stake = you.wagerStake ?? Math.max(100, you.score);
  const shown = Math.round((Math.max(you.score, 100) * pct) / 100);
  function choose(next: number) {
    const value = Math.max(25, Math.min(100, Math.round(next)));
    setPct(value);
    onPick(value);
  }
  return (
    <div className="board-play">
      <p className="bank">
        Điểm đang có: <strong data-testid="wager-score">{formatPoints(you.score)}</strong>
      </p>
      <div className="wagers">
        {WAGER_CHIPS.map((chip) => (
          <button
            type="button"
            key={chip.pct}
            data-testid={`bet-pct-${chip.pct}`}
            className={pct === chip.pct ? 'chip on' : 'chip'}
            onClick={() => choose(chip.pct)}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <label className="slider-line">
        Mức cược {pct}%
        <input data-testid="wager-slider" type="range" min={25} max={100} step={5} value={pct} onChange={(event) => choose(Number(event.target.value))} />
      </label>
      <p className="hint">
        Đang cược khoảng <strong>{formatPoints(you.wagerStake ?? shown)}</strong> điểm. Dưới 100 điểm thì tính trên mức sàn 100.
      </p>
      <p className="hint" data-testid="wager-default">
        Chưa chọn thì mặc định 25% khi mở câu hỏi.
      </p>
      {pct === 100 && <p className="bad-note">Tất tay: sai là mất khoản cược, tính trên điểm đang có.</p>}
      <span className="sr-only">{stake}</span>
    </div>
  );
}

export function BetBoard({
  challenge,
  you,
  locked,
  onPick,
  onLock,
}: Common & { challenge: Extract<PublicChallenge, { t: 'bet' }>; onPick: (optionId: string) => void; onLock: () => void }) {
  const [optionId, setOptionId] = useState<string | null>(null);
  const done = you.submitted || locked;
  return (
    <div className="board-play">
      <p className="scenario">{challenge.scenario}</p>
      <p className="bank">
        Đã khóa cược {you.wagerPct ?? 25}% · <strong>{formatPoints(you.wagerStake ?? 0)}</strong> điểm
      </p>
      <div className="options">
        {challenge.options.map((option) => (
          <button
            type="button"
            key={option.id}
            data-testid={`bet-option-${option.id}`}
            className={optionId === option.id ? 'opt on' : 'opt'}
            disabled={done}
            onClick={() => {
              setOptionId(option.id);
              onPick(option.id);
            }}
          >
            {option.text}
          </button>
        ))}
      </div>
      <SaveHint done={you.submitted} />
      <button type="button" className="btn btn-red" data-testid="bet-lock" disabled={done || !optionId} onClick={onLock}>
        {you.submitted ? 'Đã chốt' : 'Chốt đáp án'}
      </button>
    </div>
  );
}

export function BucketBoard({
  challenge,
  you,
  locked,
  onSubmit,
  onLock,
}: Common & {
  challenge: Extract<PublicChallenge, { t: 'bucket' }>;
  onSubmit: (picks: { id: string; side: 'left' | 'right' }[]) => void;
  onLock: () => void;
}) {
  const [side, setSide] = useState<Record<string, 'left' | 'right'>>({});
  const [drag, setDrag] = useState<{ id: string; x: number } | null>(null);
  const done = you.submitted || locked;
  const placed = challenge.cards.filter((card) => side[card.id]);
  const pool = challenge.cards.filter((card) => !side[card.id]);

  function put(id: string, next: 'left' | 'right') {
    if (done) return;
    const picks = { ...side, [id]: next };
    setSide(picks);
    onSubmit(Object.entries(picks).map(([cardId, cardSide]) => ({ id: cardId, side: cardSide })));
  }

  return (
    <div className="board-play">
      <div className="bucket-cols">
        {(['left', 'right'] as const).map((column) => (
          <div key={column}>
            <p className="col-title">{column === 'left' ? challenge.leftLabel : challenge.rightLabel}</p>
            {placed
              .filter((card) => side[card.id] === column)
              .map((card) => (
                <button type="button" key={card.id} className="tile on" disabled={done} onClick={() => put(card.id, column === 'left' ? 'right' : 'left')}>
                  {card.text}
                </button>
              ))}
          </div>
        ))}
      </div>
      <div className="bucket-pool">
        {pool.map((card) => (
          <article
            key={card.id}
            className="swipe-card"
            tabIndex={done ? -1 : 0}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                put(card.id, 'left');
              }
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                put(card.id, 'right');
              }
            }}
            onPointerDown={(event) => setDrag({ id: card.id, x: event.clientX })}
            onPointerUp={(event) => {
              if (!drag || drag.id !== card.id) return;
              const dx = event.clientX - drag.x;
              if (dx <= -36) put(card.id, 'left');
              else if (dx >= 36) put(card.id, 'right');
              setDrag(null);
            }}
          >
            <p>{card.text}</p>
            <div className="nudges">
              <button type="button" data-testid={`bucket-left-${card.id}`} disabled={done} onClick={() => put(card.id, 'left')}>
                {challenge.leftLabel}
              </button>
              <button type="button" data-testid={`bucket-right-${card.id}`} disabled={done} onClick={() => put(card.id, 'right')}>
                {challenge.rightLabel}
              </button>
            </div>
          </article>
        ))}
      </div>
      <SaveHint done={you.submitted} />
      <button
        type="button"
        className="btn btn-red"
        data-testid="bucket-lock"
        disabled={done || placed.length === 0}
        onClick={() => {
          onSubmit(Object.entries(side).map(([cardId, cardSide]) => ({ id: cardId, side: cardSide })));
          onLock();
        }}
      >
        {you.submitted ? 'Đã chốt' : 'Chốt hai phía'}
      </button>
    </div>
  );
}

export function RecruitBoard({
  challenge,
  you,
  locked,
  onSubmit,
  onLock,
}: Common & { challenge: Extract<PublicChallenge, { t: 'recruit' }>; onSubmit: (ids: string[]) => void; onLock: () => void }) {
  const [ids, setIds] = useState<string[]>([]);
  const done = you.submitted || locked;
  function toggle(id: string) {
    if (done) return;
    const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
    setIds(next);
    onSubmit(next);
  }
  return (
    <div className="board-play">
      <div className="options">
        {challenge.cards.map((card) => (
          <button
            type="button"
            key={card.id}
            data-testid={`recruit-${card.id}`}
            className={ids.includes(card.id) ? 'opt on' : 'opt'}
            disabled={done}
            onClick={() => toggle(card.id)}
          >
            {card.text}
          </button>
        ))}
      </div>
      <p className="hint">Đã chọn {ids.length}. Chọn nhầm sẽ bị trừ điểm.</p>
      <SaveHint done={you.submitted} />
      <button type="button" className="btn btn-red" data-testid="recruit-lock" disabled={done || ids.length === 0} onClick={onLock}>
        {you.submitted ? 'Đã chốt mặt trận' : 'Chốt mặt trận'}
      </button>
    </div>
  );
}
