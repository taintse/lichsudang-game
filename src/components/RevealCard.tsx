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
      {reveal.map && (
        <>
          <VietnamMap
            markers={reveal.map.choices.map((choice) => ({
              id: choice.id,
              x: choice.x,
              y: choice.y,
              correct: choice.correct,
              selected: you?.mapChoice === choice.id && !choice.correct,
              count: big ? choice.count : undefined,
              label: choice.correct || big ? choice.label : undefined,
            }))}
          />
          {big && (
            <ul className="answer-list" data-testid="map-counts">
              {reveal.map.choices.map((choice) => (
                <li key={choice.id}>
                  <b>
                    {choice.count} người{choice.correct ? ' · đúng' : ''}
                  </b>
                  <span>{choice.label}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
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
