import type { PlatformKey } from './platforms';

export type TemplateId = 'obsidian' | 'onyx' | 'prism' | 'ivory' | 'carbon' | 'overture';

export type LinkStyle = 'default' | 'primary' | 'filled';

export interface TemplateLink {
  platform: PlatformKey;
  action: string; // "Écouter", "Regarder", "Acheter" — keep single string; localized if needed
  style?: LinkStyle;
}

export interface TemplateDef {
  id: TemplateId;
  linkStyle: 'light' | 'filled' | 'glass' | 'ivory' | 'carbon' | 'overture';
  links: TemplateLink[];
}

/**
 * Structural template definitions (links composition, rendering variant).
 * Textual bits (name, tag) live in locale content files so they can be translated.
 */
export const TEMPLATES: TemplateDef[] = [
  {
    id: 'obsidian',
    linkStyle: 'light',
    links: [
      { platform: 'spotify', action: 'Écouter', style: 'primary' },
      { platform: 'apple', action: 'Écouter' },
      { platform: 'youtubemusic', action: 'Regarder' },
      { platform: 'deezer', action: 'Écouter' },
      { platform: 'tidal', action: 'Écouter' },
      { platform: 'amazon', action: 'Écouter' },
    ],
  },
  {
    id: 'onyx',
    linkStyle: 'filled',
    links: [
      { platform: 'spotify', action: 'Écouter' },
      { platform: 'apple', action: 'Écouter' },
      { platform: 'youtubemusic', action: 'Regarder' },
      { platform: 'deezer', action: 'Écouter' },
      { platform: 'tidal', action: 'Écouter' },
    ],
  },
  {
    id: 'prism',
    linkStyle: 'glass',
    links: [
      { platform: 'spotify', action: 'Écouter', style: 'primary' },
      { platform: 'apple', action: 'Écouter' },
      { platform: 'deezer', action: 'Écouter' },
      { platform: 'youtubemusic', action: 'Regarder' },
      { platform: 'soundcloud', action: 'Écouter' },
    ],
  },
  {
    id: 'ivory',
    linkStyle: 'ivory',
    links: [
      { platform: 'spotify', action: 'Écouter' },
      { platform: 'apple', action: 'Écouter' },
      { platform: 'deezer', action: 'Écouter' },
      { platform: 'youtubemusic', action: 'Regarder' },
      { platform: 'bandcamp', action: 'Acheter' },
    ],
  },
  {
    id: 'carbon',
    linkStyle: 'carbon',
    links: [
      { platform: 'spotify', action: 'Écouter' },
      { platform: 'apple', action: 'Écouter' },
      { platform: 'tidal', action: 'Écouter' },
      { platform: 'deezer', action: 'Écouter' },
      { platform: 'qobuz', action: 'Écouter' },
      { platform: 'amazon', action: 'Écouter' },
    ],
  },
];

export const TEMPLATE_ARTWORK = '/images/accounts/band8.jpg';
export const TEMPLATE_TITLE = 'Les Failles du Monde';
export const TEMPLATE_ARTIST = 'Nihil Veins';
