import type { RevealPublic, YouState } from '../game/types';
import { formatPoints } from '../game/text';
import { VietnamMap } from './VietnamMap';

export function RevealCard({ reveal, you, big = false }: { reveal: RevealPublic; you?: YouState | null; big?: boolean }) {
  const result = you?.lastResult;
  return (
    <article className={big ? 'reveal big' : 'reveal'} data-testid="reveal">
      <p className="stamp">Đáp án</p>
      <h2>{reveal.headline}</h2>
      {result && (
        <p className={result.delta > 0 ? 'delta good' : result.delta < 0 ? 'delta bad' : 'delta'} data-testid="delta">
          {result.delta > 0 ? `+${formatPoints(result.delta)}` : formatPoints(result.delta)} · {result.note}
          {result.correct && you && you.combo >= 2 ? ` · chuỗi ${you.combo}` : ''}
        </p>
      )}
      {reveal.timeline && (
        <ol className="answer-list">
          {reveal.timeline.map((item) => (
            <li key={item.year}>
              <b>{item.year}</b>
              <span>{item.text}</span>
            </li>
          ))}
        </ol>
      )}
      {reveal.map && <VietnamMap correct={{ x: reveal.map.x, y: reveal.map.y, label: reveal.map.label }} pin={you?.mapPin} guesses={big ? reveal.map.guesses : []} />}
      {reveal.pairs && (
        <ul className="answer-list pairs">
          {reveal.pairs.map((pair) => (
            <li key={pair.left}>
              <span>{pair.left}</span>
              <b>{pair.right}</b>
            </li>
          ))}
        </ul>
      )}
      <p className="explain">{reveal.explanation}</p>
    </article>
  );
}
