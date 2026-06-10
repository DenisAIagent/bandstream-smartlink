/**
 * Shared types for SmartLink templates.
 *
 * All 5 templates accept the same `SmartLinkBaseProps` shape so the
 * SmartLinkRenderer can swap them based on `band.template` without
 * having to know the template internals.
 */

export interface PlatformEntry {
  /** Canonical platform key — see PLATFORM_CONFIG in PlatformIcon.tsx */
  platform: string;
  /** Direct URL to the platform's listen page */
  url: string;
  /** Optional CTA label override (defaults to "Écouter" / "Listen") */
  action?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: React.ReactNode;
}

export interface SmartLinkBaseProps {
  title: string;
  artistName: string;
  subtitle?: string;
  thumbnailUrl: string;
  platforms: PlatformEntry[];
  socials?: SocialLink[];
  /** Newsletter callback. If absent, the newsletter section is hidden. */
  onNewsletterSubmit?: (email: string) => Promise<void> | void;
  /** Footer "Powered by" link target */
  brandUrl?: string;
  /** Optional accent color override (extracted from cover artwork) */
  accentColor?: string;
}

/** All template IDs supported by SmartLinkRenderer */
export const TEMPLATE_IDS = ['obsidian', 'onyx', 'prism', 'ivory', 'carbon'] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export function isValidTemplateId(value: string | null | undefined): value is TemplateId {
  return typeof value === 'string' && (TEMPLATE_IDS as readonly string[]).includes(value);
}
