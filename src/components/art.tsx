import type { AvatarId } from '../game/types';

export function Grain() {
  return (
    <svg className="grain" aria-hidden="true">
      <filter id="paper-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-grain)" />
    </svg>
  );
}

export function Star({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <polygon fill="currentColor" points="32,4 39,24 60,24 43,37 49,58 32,46 15,58 21,37 4,24 25,24" />
    </svg>
  );
}

function Icon({ id }: { id: AvatarId }) {
  switch (id) {
    case 'star':
      return <polygon points="32,6 38,24 58,24 42,36 48,56 32,45 16,56 22,36 6,24 26,24" />;
    case 'lotus':
      return (
        <path d="M32 50c8-8 8-16 0-28-8 12-8 20 0 28zm0 0c10-2 16-10 14-20-8 2-12 8-14 20zm0 0C22 48 16 40 18 30c8 2 12 8 14 20z" />
      );
    case 'torch':
      return <path d="M30 58h4V30h-4zm-6-30c0-10 8-22 8-22s8 12 8 22c0 6-4 8-8 8s-8-2-8-8z" />;
    case 'drum':
      return <path d="M14 28h36v8c0 10-8 16-18 16S14 46 14 36zm4-6h28l-4-8H22z" />;
    case 'lantern':
      return <path d="M28 10h8v4h6l-4 8v16l4 8h-6v4h-8v-4h-6l4-8V22l-4-8h6zm4 10v16" />;
    case 'dove':
      return <path d="M10 36c12-2 16-10 18-16 2 8 10 12 22 10-8 2-12 8-14 14-4-6-10-8-16-6-4 6-8 8-10 8 2-4 2-8 0-10z" />;
    case 'rice':
      return <path d="M32 8c2 8 2 14 0 22-2-8-2-14 0-22zm0 18c8 2 14 6 18 14-8-2-14-4-18-8 4 4 6 10 6 18-6-6-8-12-6-20-2 8 0 14 6 20-8-4-12-10-12-18 6 2 10 6 12 8-4-8-10-12-18-14 8 2 14 0 18-8z" />;
    case 'boat':
      return <path d="M8 40h48l-6 10H14zm10-6 14-18 14 18zm14-22v18" />;
    case 'mountain':
      return <path d="M6 52 24 18l10 16 8-12 16 30z" />;
    case 'book':
      return <path d="M10 16h18c4 0 6 2 6 6v28c-4-2-8-2-12-2H10zm44 0H36c-4 0-6 2-6 6v28c4-2 8-2 12-2h12z" />;
    case 'sun':
      return (
        <g>
          <circle cx="32" cy="32" r="10" />
          <path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M14 50l6-6M44 20l6-6" />
        </g>
      );
    case 'flag':
      return <path d="M16 8h4v48h-4zm4 4h28l-6 10 6 10H20z" />;
    default:
      return null;
  }
}

export function Avatar({ id, size = 48 }: { id: string; size?: number }) {
  const safe = id as AvatarId;
  return (
    <svg className="avatar" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" />
      <g fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
        <Icon id={safe} />
      </g>
    </svg>
  );
}

export function StageArt({ theme }: { theme: string }) {
  if (theme === 'autumn') {
    return (
      <svg className="stage-art" viewBox="0 0 200 120" aria-hidden="true">
        <circle cx="150" cy="48" r="28" />
        <path d="M8 100 50 58l24 22 28-34 40 54H8z" />
      </svg>
    );
  }
  if (theme === 'dbp') {
    return (
      <svg className="stage-art" viewBox="0 0 200 120" aria-hidden="true">
        <path d="M0 96 36 60l22 16 30-40 26 22 34-46 52 84z" />
        <path d="M92 28v34" />
        <path d="M92 34h22l-5 8 5 8H92" />
      </svg>
    );
  }
  if (theme === 'victory') {
    return (
      <svg className="stage-art" viewBox="0 0 200 120" aria-hidden="true">
        <circle cx="100" cy="78" r="36" />
        <path d="M100 8v28M52 30l18 18M148 30l-18 18M28 78h24M148 78h24" />
      </svg>
    );
  }
  if (theme === 'doimoi') {
    return (
      <svg className="stage-art" viewBox="0 0 200 120" aria-hidden="true">
        <path d="M16 96c28-36 48-36 68-8 18 24 40 20 70-20" />
        <path d="M118 40c8 10 8 18 0 28 14-2 22-10 24-22-10 2-18 0-24-6z" />
        <circle cx="150" cy="36" r="14" />
      </svg>
    );
  }
  if (theme === 'podium') {
    return (
      <svg className="stage-art" viewBox="0 0 200 120" aria-hidden="true">
        <polygon points="100,12 112,46 148,46 118,66 128,102 100,82 72,102 82,66 52,46 88,46" />
      </svg>
    );
  }
  return (
    <svg className="stage-art" viewBox="0 0 200 120" aria-hidden="true">
      <path d="M100 96c18-24 18-40 0-62-18 22-18 38 0 62zm0 0c22-4 36-18 32-36-16 4-24 14-32 36zm0 0c-22-4-36-18-32-36 16 4 24 14 32 36z" />
    </svg>
  );
}
