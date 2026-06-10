/**
 * Adapter — converts the DB-shaped `Band` (with related `BandPlatform[]`)
 * into the prop shape expected by all 5 SmartLink templates.
 *
 * Notes:
 * - Platform.shortname in the DB uses internal slugs (`applemusic`,
 *   `youtubemusic`, ...) which differ from the canonical keys used by
 *   the templates (`apple_music`, `youtube_music`, ...). The mapping
 *   is centralized here so a future rename of either side touches
 *   exactly one file.
 * - `youtube` and `youtube_music` are intentionally distinct platforms
 *   (video clips vs streaming-only).
 */
import type { Band } from '@/types/bandstream';
import type { PlatformEntry, SmartLinkBaseProps } from './shared';

/**
 * Map DB Platform.shortname to the canonical template platform key.
 * Returns the input unchanged if no remapping is needed (e.g. "spotify").
 */
const SHORTNAME_MAP: Record<string, string> = {
  applemusic: 'apple_music',
  youtubemusic: 'youtube_music',
  amazonmusic: 'amazon_music',
  yandexmusic: 'yandex_music',
  // youtube, spotify, deezer, tidal, qobuz, soundcloud, napster, pandora, bandcamp
  // pass through unchanged
};


/**
 * customURL est normalement un chemin relatif à la base de la plateforme,
 * mais les données issues de l'autofill Odesli peuvent contenir une URL
 * absolue — dans ce cas on l'utilise telle quelle.
 */
export function joinPlatformUrl(baseURL: string, customURL: string): string {
  if (customURL.startsWith('http://') || customURL.startsWith('https://')) {
    return customURL;
  }
  return baseURL + '/' + customURL;
}

export function mapPlatformShortname(shortname: string): string {
  return SHORTNAME_MAP[shortname] ?? shortname;
}

/**
 * Build the props passed to any SmartLink template from a `Band`.
 * Newsletter callback and socials are intentionally omitted (V1 of #42)
 * — see #62 (newsletter) and #63 (socials) for follow-up work.
 */
export function buildSmartLinkProps(band: Band, accentRgb?: [number, number, number]): SmartLinkBaseProps {
  const platforms: PlatformEntry[] = (band.platforms ?? []).map(bp => ({
    platform: mapPlatformShortname(bp.platform.shortname),
    url: joinPlatformUrl(bp.platform.URL, bp.customURL),
  }));

  const accentColor = accentRgb
    ? `rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]})`
    : undefined;

  return {
    title: band.album ?? band.name,
    artistName: band.name,
    subtitle: undefined,
    thumbnailUrl: band.coverImage ?? '/images/bandstream/emptycover.jpg',
    platforms,
    accentColor,
    brandUrl: '/',
    // onNewsletterSubmit: undefined  → newsletter hidden, see #62
    // socials: undefined             → socials hidden,    see #63
  };
}

/** Minimal shapes for the SmartLink render path (subset of the Prisma selects). */
export interface SmartLinkRenderData {
  title: string;
  coverImage: string | null;
  template: string | null;
  platforms: {
    platform: { shortname: string; URL: string };
    customURL: string;
  }[];
}

/**
 * Build template props from a `SmartLink` (one release) + its artist.
 */
export function buildSmartLinkPropsFromSmartLink(
  band: { name: string },
  smartLink: SmartLinkRenderData,
  accentRgb?: [number, number, number]
): SmartLinkBaseProps {
  const platforms: PlatformEntry[] = (smartLink.platforms ?? []).map(sp => ({
    platform: mapPlatformShortname(sp.platform.shortname),
    url: joinPlatformUrl(sp.platform.URL, sp.customURL),
  }));

  const accentColor = accentRgb
    ? `rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]})`
    : undefined;

  return {
    title: smartLink.title,
    artistName: band.name,
    subtitle: undefined,
    thumbnailUrl: smartLink.coverImage ?? '/images/bandstream/emptycover.jpg',
    platforms,
    accentColor,
    brandUrl: '/',
  };
}
