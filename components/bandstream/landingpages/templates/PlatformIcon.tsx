/**
 * PlatformIcon — official streaming platform logos.
 *
 * Loads the real SVG logos from /public/images/platform-icons/*.svg
 * (provided in #42 by @morveus, simple-icons style).
 *
 * Two rendering strategies depending on the logo complexity:
 *
 * - MASK_IMAGE (default): uses CSS mask-image to apply the SVG as a shape
 *   and fills it with the requested color. Lets templates freely tint the
 *   icon to brand color, white (for dark backgrounds), or any custom hex.
 *   Works perfectly for single-path logos.
 *
 * - IMG (exception list): renders the SVG as a plain <img>. Used for logos
 *   that cannot be color-masked safely (wordmarks, multi-path with filled
 *   outer shapes, non-24x24 viewBoxes). These stay in their original black
 *   ink and can only be whitened via CSS `filter: brightness(0) invert(1)`
 *   if a template needs them on a dark background.
 *
 * NOTE: youtube and youtube_music are intentionally distinct platforms
 * (video clips vs streaming-only) per @morveus — see #42.
 */
import { memo } from 'react';
import { Music2 } from 'lucide-react';

export interface PlatformConfig {
  name: string;
  color: string;
  /** Render strategy. 'mask' = tintable via backgroundColor, 'img' = raw SVG. */
  strategy?: 'mask' | 'img';
}

export const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
  spotify: { name: 'Spotify', color: '#1DB954' },
  apple_music: { name: 'Apple Music', color: '#FA243C' },
  youtube_music: { name: 'YouTube Music', color: '#FF0000' },
  youtube: { name: 'YouTube', color: '#FF0000' },
  deezer: { name: 'Deezer', color: '#A238FF' },
  tidal: { name: 'TIDAL', color: '#000000' },
  soundcloud: { name: 'SoundCloud', color: '#FF5500' },
  bandcamp: { name: 'Bandcamp', color: '#629AA9' },
  // Wordmark/multi-path logos — rendered as raw <img>, no tinting possible
  amazon_music: { name: 'Amazon Music', color: '#25D1DA', strategy: 'img' },
  qobuz: { name: 'Qobuz', color: '#2C8C99', strategy: 'img' },
};

interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
  /**
   * Override the fill color. Defaults to the platform's brand color from
   * PLATFORM_CONFIG. Pass '#ffffff' (or any color) to force a different tint
   * — useful for dark backgrounds where the brand color isn't readable.
   * Ignored for platforms with strategy: 'img'.
   */
  color?: string;
}

export const PlatformIcon = memo<PlatformIconProps>(function PlatformIcon({
  platform,
  size = 24,
  className,
  color,
}) {
  const config = PLATFORM_CONFIG[platform];

  // Unknown platform — fall back to a generic music note icon
  if (!config) {
    return (
      <Music2
        size={size}
        className={className}
        style={{ color: color ?? '#888' }}
        aria-label="Music Platform"
      />
    );
  }

  const url = `/images/platform-icons/${platform}.svg`;

  // Wordmark / multi-path logos: render as plain <img>, no color control
  if (config.strategy === 'img') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={config.name}
        width={size}
        height={size}
        className={className}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  // Single-path logos: use mask-image so the fill can be any color
  const fill = color ?? config.color;
  return (
    <span
      role="img"
      aria-label={config.name}
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        backgroundColor: fill,
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
});
