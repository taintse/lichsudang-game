import { useRef, useState } from 'react';
import { COUNTRY_LABELS, ISLAND_LABELS, ISLAND_PATH, MAP_LAYOUT, NEIGHBOR_PATHS, SEA_LABELS, VIETNAM_PATH } from '../geo/vietnam';

export interface MapPoint {
  x: number;
  y: number;
}

interface Props {
  pin?: MapPoint | null;
  correct?: { x: number; y: number; label: string } | null;
  guesses?: MapPoint[];
  interactive?: boolean;
  onPin?: (point: MapPoint) => void;
}

function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number): MapPoint | null {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const local = point.matrixTransform(matrix.inverse());
  return { x: Math.round(local.x * 10) / 10, y: Math.round(local.y * 10) / 10 };
}

export function VietnamMap({ pin, correct, guesses = [], interactive, onPin }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [loupe, setLoupe] = useState<{ x: number; y: number; cx: number; cy: number } | null>(null);

  function place(event: React.PointerEvent<SVGSVGElement>) {
    if (!interactive || !ref.current) return;
    const point = toSvgPoint(ref.current, event.clientX, event.clientY);
    if (!point) return;
    onPin?.(point);
    setLoupe({ x: point.x, y: point.y, cx: event.clientX, cy: event.clientY });
  }

  const zoom = loupe ? `${loupe.x - 36} ${loupe.y - 36} 72 72` : undefined;

  return (
    <div className="map-wrap">
      <svg
        ref={ref}
        data-testid="map-svg"
        className={interactive ? 'vn-map interactive' : 'vn-map'}
        viewBox={`0 0 ${MAP_LAYOUT.viewW} ${MAP_LAYOUT.viewH}`}
        role="img"
        aria-label="Sơ đồ minh họa Việt Nam"
        onPointerDown={(event) => {
          if (!interactive) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          place(event);
        }}
        onPointerMove={(event) => {
          if (!interactive || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
          place(event);
        }}
        onPointerUp={() => setLoupe(null)}
        onPointerCancel={() => setLoupe(null)}
      >
        <rect className="sea" x="0" y="0" width={MAP_LAYOUT.viewW} height={MAP_LAYOUT.viewH} />
        {NEIGHBOR_PATHS.map((shape) => (
          <path key={shape.id} className="neighbor" d={shape.d} />
        ))}
        <path className="land" d={VIETNAM_PATH} />
        <path className="land islands" d={ISLAND_PATH} />
        {COUNTRY_LABELS.map((label) => (
          <text key={label.text} className="map-label country" x={label.x} y={label.y} textAnchor={label.anchor}>
            {label.text}
          </text>
        ))}
        {SEA_LABELS.map((label) => (
          <text key={label.text} className="map-label sea-label" x={label.x} y={label.y}>
            {label.text}
          </text>
        ))}
        <text className="map-label north" x="40" y="46">
          BẮC
        </text>
        {ISLAND_LABELS.map((label) => (
          <text key={label.title} className="map-label isle-label" x={label.x} y={label.y} textAnchor="middle">
            {label.title}
            <tspan className="sub" x={label.x} dy="22">
              (Việt Nam)
            </tspan>
          </text>
        ))}
        {guesses.map((guess, index) => (
          <circle key={`${guess.x}-${guess.y}-${index}`} className="guess-dot" cx={guess.x} cy={guess.y} r="5" />
        ))}
        {pin && (
          <g className="player-pin" transform={`translate(${pin.x} ${pin.y})`}>
            <circle r="5.5" />
            <circle className="core" r="2.1" />
          </g>
        )}
        {correct && (
          <g className="correct-pin" transform={`translate(${correct.x} ${correct.y})`}>
            <polygon points="0,-9 2.4,-3 9,-3 3.6,1.2 5.6,8 0,3.6 -5.6,8 -3.6,1.2 -9,-3 -2.4,-3" />
            <text y="20">{correct.label}</text>
          </g>
        )}
      </svg>
      <p className="map-note">Sơ đồ minh họa, có Quần đảo Hoàng Sa và Trường Sa. Không phải bản đồ hành chính.</p>
      {loupe && zoom && (
        <div className="loupe" style={{ left: loupe.cx, top: loupe.cy }}>
          <svg viewBox={zoom} aria-hidden="true">
            <rect className="sea" x={loupe.x - 40} y={loupe.y - 40} width="80" height="80" />
            <path className="land" d={VIETNAM_PATH} />
            <path className="land islands" d={ISLAND_PATH} />
            <circle cx={loupe.x} cy={loupe.y} r="3" className="player-pin-dot" />
          </svg>
        </div>
      )}
    </div>
  );
}
