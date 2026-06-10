/**
 * Odesli (Songlink) API integration
 * Rate-limited to 10 requests per minute (free tier)
 * Docs: https://linktree.notion.site/API-d0ebe08a5e304a55928405eb682f6741
 */

const ODESLI_API_URL = 'https://api.song.link/v1-alpha.1/links';

// Rate limiter: max 10 requests per 60 seconds
let requestTimestamps: number[] = [];
const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000;

async function throttle(): Promise<void> {
  const now = Date.now();
  // Remove timestamps outside the window
  requestTimestamps = requestTimestamps.filter((t) => now - t < WINDOW_MS);

  if (requestTimestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = requestTimestamps[0];
    const waitMs = WINDOW_MS - (now - oldestInWindow) + 100; // +100ms buffer
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return throttle(); // Re-check after waiting
  }

  requestTimestamps.push(now);
}

// Maps Odesli API platform keys to our DB shortnames
const PLATFORM_MAP: Record<string, string> = {
  spotify: 'spotify',
  appleMusic: 'applemusic',
  youtubeMusic: 'youtubemusic',
  youtube: 'youtube',
  deezer: 'deezer',
  tidal: 'tidal',
  soundcloud: 'soundcloud',
  bandcamp: 'bandcamp',
  amazonMusic: 'amazonmusic',
  amazonStore: 'amazonstore',
  audiomack: 'audiomack',
  anghami: 'anghami',
  boomplay: 'boomplay',
  napster: 'napster',
  pandora: 'pandora',
  spinrilla: 'spinrilla',
};

// Display names and base URLs for auto-creating platforms in the DB
const PLATFORM_INFO: Record<string, { name: string; url: string }> = {
  spotify: { name: 'Spotify', url: 'https://open.spotify.com' },
  applemusic: { name: 'Apple Music', url: 'https://music.apple.com' },
  youtubemusic: { name: 'YouTube Music', url: 'https://music.youtube.com' },
  youtube: { name: 'YouTube', url: 'https://www.youtube.com' },
  deezer: { name: 'Deezer', url: 'https://www.deezer.com' },
  tidal: { name: 'Tidal', url: 'https://tidal.com' },
  soundcloud: { name: 'SoundCloud', url: 'https://soundcloud.com' },
  bandcamp: { name: 'Bandcamp', url: 'https://bandcamp.com' },
  amazonmusic: { name: 'Amazon Music', url: 'https://music.amazon.com' },
  amazonstore: { name: 'Amazon Store', url: 'https://www.amazon.com' },
  audiomack: { name: 'Audiomack', url: 'https://audiomack.com' },
  anghami: { name: 'Anghami', url: 'https://www.anghami.com' },
  boomplay: { name: 'Boomplay', url: 'https://www.boomplay.com' },
  napster: { name: 'Napster', url: 'https://www.napster.com' },
  pandora: { name: 'Pandora', url: 'https://www.pandora.com' },
  spinrilla: { name: 'Spinrilla', url: 'https://spinrilla.com' },
};

export interface OdesliPlatformLink {
  shortname: string;
  url: string;
}

export interface OdesliResult {
  platformLinks: OdesliPlatformLink[];
  title?: string;
  artistName?: string;
  thumbnailUrl?: string;
}

interface OdesliApiResponse {
  entityUniqueId: string;
  userCountry: string;
  pageUrl: string;
  linksByPlatform: Record<
    string,
    {
      entityUniqueId: string;
      url: string;
      nativeAppUriMobile?: string;
      nativeAppUriDesktop?: string;
    }
  >;
  entitiesByUniqueId: Record<
    string,
    {
      id: string;
      type: string;
      title?: string;
      artistName?: string;
      thumbnailUrl?: string;
      thumbnailWidth?: number;
      thumbnailHeight?: number;
      apiProvider: string;
      platforms: string[];
    }
  >;
}

export async function getOdesliLinks(
  songUrl: string,
  userCountry = 'FR'
): Promise<OdesliResult> {
  await throttle();

  const params = new URLSearchParams({
    url: songUrl,
    userCountry,
  });

  const response = await fetch(`${ODESLI_API_URL}?${params.toString()}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Odesli API error (${response.status}): ${text}`
    );
  }

  const data: OdesliApiResponse = await response.json();

  // Extract platform links
  const platformLinks: OdesliPlatformLink[] = [];
  for (const [odesliKey, linkData] of Object.entries(data.linksByPlatform)) {
    const shortname = PLATFORM_MAP[odesliKey];
    if (shortname) {
      platformLinks.push({
        shortname,
        url: linkData.url,
      });
    }
  }

  // Extract metadata from the first entity
  let title: string | undefined;
  let artistName: string | undefined;
  let thumbnailUrl: string | undefined;

  const entityKey = data.entityUniqueId;
  if (entityKey && data.entitiesByUniqueId[entityKey]) {
    const entity = data.entitiesByUniqueId[entityKey];
    title = entity.title;
    artistName = entity.artistName;
    thumbnailUrl = entity.thumbnailUrl;
  }

  return { platformLinks, title, artistName, thumbnailUrl };
}

export { PLATFORM_INFO };
