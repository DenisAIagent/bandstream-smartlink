import { PLATFORMS, type PlatformKey } from '../content/platforms';

interface PlatformIconProps {
  platform: PlatformKey;
  className?: string;
}

/**
 * Renders the inline SVG for a streaming platform icon.
 * Uses `currentColor` so the surrounding class controls the tint.
 */
export default function PlatformIcon({ platform, className }: PlatformIconProps) {
  const p = PLATFORMS[platform];
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label={p.name}>
      <path d={p.path} />
    </svg>
  );
}
