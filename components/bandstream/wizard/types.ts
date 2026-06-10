import type { TemplateId } from '@/components/bandstream/landingpages/templates/shared';

export interface WizardPlatform {
  id: number;
  name: string;
  shortname: string;
  logo: string | null;
  URL: string;
}

export interface WizardState {
  bandId: number | null;
  name: string;
  slug: string;
  /** Full URLs pasted by the user, keyed by platformId */
  platformUrls: Record<number, string>;
  template: TemplateId;
  coverFile: File | null;
  coverPreview: string | null;
  publishedUrl: string | null;
}

export const WIZARD_STEPS = ['name', 'platforms', 'design', 'publish'] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];
