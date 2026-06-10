export type HomeLocale = 'fr' | 'en';

export interface HomeCopy {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    features: string;
    smartlinks: string;
    pricing: string;
    faq: string;
    cta: string;
    themeToggleLabel: string;
  };
  hero: {
    kicker: string;
    titleLine1: string;
    titleLine2a: string;
    titleLine2em: string;
    titleLine3: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    hint: string;
    phoneAriaLabel: string;
    floater1: { label: string; sub: string };
    floater2: { label: string; sub: string };
    floater3: { labelSuffix: string };
  };
  platformsStrip: {
    label: string;
  };
  steps: {
    eyebrow: string;
    titlePre: string;
    titleEm: string;
    titlePost: string;
    sub: string;
    items: Array<{ title: string; body: string }>;
  };
  features: {
    eyebrow: string;
    titlePre: string;
    titleEm: string;
    titlePost: string;
    sub: string;
    items: Array<{ title: string; body: string; span2?: boolean; icon: 'link' | 'search' | 'chart' | 'layout' }>;
  };
  smartlinks: {
    eyebrow: string;
    titlePre: string;
    titleEm: string;
    titlePost: string;
    sub: string;
    phoneAriaLabel: string;
    templates: Array<{ id: string; name: string; tag: string }>;
  };
  manifesto: {
    eyebrow: string;
    titlePart1: string; // "Pourquoi payer "
    titleStrike: string; // "46 €"
    titlePart2: string; // "pour un "
    titleEm: string; // "lien en bio"
    titlePart3: string; // " ?"
    body: string;
    bodyAccent: string;
    signatureName: string;
    signatureSub: string;
    signatureMark: string;
    watermark: string;
  };
  compare: {
    eyebrow: string;
    titlePre: string;
    titleEm: string;
    titlePost: string;
    sub: string;
    usBadge: string;
    headers: string[];
    rows: Array<{ label: string; values: Array<string | { type: 'check' | 'nope' | 'warn' | 'plain' | 'price'; value?: string; sub?: string }> }>;
  };
  pricing: {
    eyebrow: string;
    titlePre: string;
    titleEm: string;
    titlePost: string;
    sub: string;
    badge: string;
    plans: Array<{
      kicker: string;
      name: string;
      desc: string;
      amount: string;
      per: string;
      featured?: boolean;
      features: string[];
      ctaLabel: string;
      ctaVariant: 'primary' | 'ghost';
    }>;
  };
  ctaBig: {
    titlePre: string;
    titleEm: string;
    titlePost: string;
    sub: string;
    emailPlaceholder: string;
    submitLabel: string;
    submitting: string;
    successMsg: string;
    errorMsg: string;
    duplicateMsg: string;
    hint: string;
  };
  faq: {
    eyebrow: string;
    titlePre: string;
    titleEm: string;
    titlePost: string;
    items: Array<{ q: string; a: string }>;
  };
  footer: {
    brandTagline: string;
    sections: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
    copyright: string;
    socialInstagram: string;
    socialLinkedIn: string;
    socialTwitter: string;
  };
}
