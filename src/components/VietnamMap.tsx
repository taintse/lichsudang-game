import { COUNTRY_LABELS, ISLAND_LABELS, ISLAND_PATH, MAP_LAYOUT, NEIGHBOR_PATHS, SEA_LABELS, VIETNAM_PATH } from '../geo/vietnam';

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  selected?: boolean;
  correct?: boolean;
  count?: number;
  label?: string;
}

interface Props {
  markers?: MapMarker[];
  onSelect?: (id: string) => void;
}

export function VietnamMap({ markers = [], onSelect }: Props) {
  return (
    <div className="map-wrap">
      <svg
        data-testid="map-svg"
        className="vn-map"
        viewBox={`0 0 ${MAP_LAYOUT.viewW} ${MAP_LAYOUT.viewH}`}
        role="img"
        aria-label="Sơ đồ minh họa Việt Nam"
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
      </svg>
      <div className="map-hits">
        {markers.map((marker) => (
          <button
            type="button"
            key={marker.id}
            data-testid={`map-marker-${marker.id}`}
            className={marker.correct ? 'map-marker correct' : marker.selected ? 'map-marker on' : 'map-marker'}
            style={{ left: `${(marker.x / MAP_LAYOUT.viewW) * 100}%`, top: `${(marker.y / MAP_LAYOUT.viewH) * 100}%` }}
            disabled={!onSelect}
            aria-label={marker.label ? marker.label : 'Địa điểm trên sơ đồ'}
            onClick={() => onSelect?.(marker.id)}
          >
            <svg viewBox="0 0 64 64" aria-hidden="true">
              {marker.selected || marker.correct ? (
                <polygon points="32,6 38,24 58,26 42,38 48,56 32,46 16,56 22,38 6,26 26,24" />
              ) : (
                <circle cx="32" cy="32" r="16" />
              )}
            </svg>
            {marker.count != null && <em>{marker.count}</em>}
            {marker.label && <b>{marker.label}</b>}
          </button>
        ))}
      </div>
      <p className="map-note">Sơ đồ minh họa, có Quần đảo Hoàng Sa và Trường Sa. Không phải bản đồ hành chính.</p>
    </div>
  );
}
