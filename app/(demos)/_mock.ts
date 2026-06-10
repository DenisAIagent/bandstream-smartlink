/**
 * Mock data for /demo, /demo2 ... /demo5 preview routes.
 * Used to render the SmartLink templates in isolation, with no DB call.
 */
import type { SmartLinkBaseProps } from '@/components/bandstream/landingpages/templates/shared';

export const demoProps: SmartLinkBaseProps = {
  title: 'Echoes of Tomorrow',
  artistName: 'Aurora Skies',
  subtitle: 'New album · Out now',
  thumbnailUrl: 'https://picsum.photos/seed/aurora-skies/600/600',
  brandUrl: '/',
  platforms: [
    { platform: 'spotify', url: 'https://open.spotify.com' },
    { platform: 'apple_music', url: 'https://music.apple.com' },
    { platform: 'youtube_music', url: 'https://music.youtube.com' },
    { platform: 'youtube', url: 'https://youtube.com' },
    { platform: 'deezer', url: 'https://deezer.com' },
    { platform: 'tidal', url: 'https://tidal.com' },
    { platform: 'amazon_music', url: 'https://music.amazon.com' },
    { platform: 'soundcloud', url: 'https://soundcloud.com' },
    { platform: 'qobuz', url: 'https://qobuz.com' },
    { platform: 'bandcamp', url: 'https://bandcamp.com' },
  ],
  // newsletter and socials intentionally omitted (V1 of #42)
};
