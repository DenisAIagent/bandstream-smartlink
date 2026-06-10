'use client';
/**
 * ┌─────────────────────────────────────────────┐
 * │  MODÈLE 03 — PRISM by Bandstream             │
 * │  SmartLink propriétaire Bandstream           │
 * │                                              │
 * │  Best-of :                                   │
 * │  · Fond immersif artwork (Obsidian)          │
 * │  · Split view desktop (Onyx)                 │
 * │  · Boutons glass + accent couleur plateforme │
 * │  · CTA primaire gradient                     │
 * │  · Newsletter inline dépliable              │
 * │  · Réseaux sociaux                           │
 * │  · Micro-interactions premium                │
 * └─────────────────────────────────────────────┘
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Music2, ChevronRight, ExternalLink, Play } from 'lucide-react';
import { PlatformIcon, PLATFORM_CONFIG } from '../PlatformIcon';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlatformEntry {
  platform: string;
  url: string;
  action?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: React.ReactNode;
}

export interface SmartLinkPrismProps {
  title: string;
  artistName: string;
  subtitle?: string;
  thumbnailUrl: string;
  platforms: PlatformEntry[];
  socials?: SocialLink[];
  onNewsletterSubmit?: (email: string) => Promise<void> | void;
  brandUrl?: string;
  /** Couleur d'accent (extraite de l'artwork). Défaut : couleur de la 1re plateforme */
  accentColor?: string;
}

// ─── Animations ─────────────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Newsletter ─────────────────────────────────────────────────────────────

function Newsletter({
  artistName,
  accentColor,
  onSubmit,
}: {
  artistName: string;
  accentColor: string;
  onSubmit: (email: string) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await onSubmit(email.trim());
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.06] backdrop-blur-md"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accentColor}30` }}
        >
          <Check className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Inscription confirmée</p>
          <p className="text-xs text-white/40">Vous serez notifié des prochaines sorties.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.06] backdrop-blur-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-5 py-4 hover:bg-white/[0.04] transition-colors"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accentColor}25` }}
        >
          <Mail className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-white">Newsletter</p>
          <p className="text-xs text-white/40">Sorties de {artistName}</p>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-white/30 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoFocus
                className="flex-1 min-w-0 px-4 py-2.5 bg-white/[0.08] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:brightness-110 shrink-0"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)` }}
              >
                {loading ? '...' : 'OK'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Platform button ────────────────────────────────────────────────────────

function PlatformBtn({
  link,
  isFirst,
  accentColor,
}: {
  link: PlatformEntry;
  isFirst: boolean;
  accentColor: string;
}) {
  const config = PLATFORM_CONFIG[link.platform];
  const displayName = config?.name ?? link.platform;
  const color = config?.color ?? '#888';
  const actionLabel = link.action ?? 'Écouter';

  if (isFirst) {
    return (
      <motion.a
        variants={slideUp}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-4 w-full py-4 px-5 rounded-2xl text-white overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}BB)`,
        }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
          <PlatformIcon platform={link.platform} size={22} color="#ffffff" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-bold block">{displayName}</span>
          <span className="text-xs text-white/60">{actionLabel} maintenant</span>
        </div>
        <Play className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
      </motion.a>
    );
  }

  return (
    <motion.a
      variants={slideUp}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 w-full py-3 px-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/[0.06] hover:bg-white/[0.1] hover:border-white/[0.12] transition-all duration-200"
    >
      {/* Accent bar */}
      <div
        className="w-1 h-8 rounded-full shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />

      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0">
        <PlatformIcon platform={link.platform} size={18} />
      </div>

      {/* Name */}
      <span className="flex-1 text-[14px] font-medium text-white/80 group-hover:text-white transition-colors">
        {displayName}
      </span>

      {/* Action */}
      <span className="text-xs font-semibold text-white/40 group-hover:text-white/70 uppercase tracking-wide transition-colors">
        {actionLabel}
      </span>
    </motion.a>
  );
}

// ─── Social icons ───────────────────────────────────────────────────────────

function Socials({ links, accentColor }: { links: SocialLink[]; accentColor: string }) {
  return (
    <motion.div variants={slideUp} className="flex items-center justify-center gap-2.5">
      {links.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ '--hover-color': accentColor } as React.CSSProperties}
        >
          {s.icon ?? <ExternalLink className="w-3.5 h-3.5 text-white/50" />}
        </a>
      ))}
    </motion.div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function SmartLinkPrism({
  title,
  artistName,
  subtitle,
  thumbnailUrl,
  platforms,
  socials,
  onNewsletterSubmit,
  brandUrl = '/',
  accentColor,
}: SmartLinkPrismProps) {
  const accent =
    accentColor ??
    PLATFORM_CONFIG[platforms[0]?.platform ?? '']?.color ??
    '#0ED894';

  return (
    <div className="min-h-dvh bg-dark-950 text-white overflow-hidden">
      {/* ─── Background: deep dark + subtle accent radial gradient ─── */}
      {/* No artwork here on purpose — the artwork lives in the foreground   */}
      {/* (full-bleed square on mobile, floating-with-glow on desktop). A    */}
      {/* fixed background image conflicted with the mobile -mt-16 overlap   */}
      {/* and made the cover "swap" places with the text on scroll.          */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${accent}25 0%, transparent 60%)`,
          }}
        />
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 min-h-dvh">
        {/* Desktop: split — Mobile: stacked */}
        <div className="min-h-dvh flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-12 lg:px-8 lg:py-12 max-w-[960px] mx-auto">

          {/* ─── Left / Top : Artwork ─── */}
          {/* NOTE: framer-motion entry animations removed here. They were causing
              a hydration-time visual glitch on mobile/tablet (title visible →
              disappears → page shifts). Hover effects and AnimatePresence on
              children buttons are unaffected. */}
          <div className="lg:w-[400px] shrink-0">
            {/* Mobile: full-bleed artwork */}
            <div className="lg:hidden relative">
              <img
                src={thumbnailUrl}
                alt={`${title} artwork`}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-950" />
            </div>

            {/* Desktop: floating artwork with glow */}
            <div className="hidden lg:block relative">
              <div
                className="absolute -inset-8 rounded-3xl blur-3xl opacity-30"
                style={{ backgroundColor: accent }}
              />
              <img
                src={thumbnailUrl}
                alt={`${title} artwork`}
                className="relative w-full aspect-square rounded-2xl object-cover shadow-2xl shadow-black/50 ring-1 ring-white/10"
              />
            </div>
          </div>

          {/* ─── Right / Bottom : Info + Buttons ─── */}
          {/* relative + z-0 creates an explicit stacking context. Without it,
              the container's paint order relative to the fixed background
              layer was unstable on certain viewports (title glitch at
              hydration). See #42 thread for analysis. */}
          <div className="relative z-0 flex-1 min-w-0 px-5 pb-8 -mt-16 lg:mt-0 lg:px-0 lg:max-w-[420px]">
            {/* Title & Artist */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold leading-tight tracking-tight">
                {title}
              </h1>
              <p className="mt-1.5 text-base lg:text-lg text-white/60 font-medium">
                {artistName}
              </p>
              {subtitle && (
                <p className="mt-2 text-sm text-white/35">{subtitle}</p>
              )}
            </div>

            {/* Platform buttons */}
            <div className="space-y-2.5 mb-5">
              {platforms.map((link, i) => (
                <PlatformBtn
                  key={link.platform}
                  link={link}
                  isFirst={i === 0}
                  accentColor={accent}
                />
              ))}
            </div>

            {/* Newsletter */}
            {onNewsletterSubmit && (
              <div className="mb-5">
                <Newsletter
                  artistName={artistName}
                  accentColor={accent}
                  onSubmit={onNewsletterSubmit}
                />
              </div>
            )}

            {/* Socials */}
            {socials && socials.length > 0 && (
              <Socials links={socials} accentColor={accent} />
            )}

            {/* Footer */}
            <div
              className="flex items-center justify-center lg:justify-start gap-1.5 mt-8"
            >
              <span className="text-[10px] uppercase tracking-[0.15em] text-white/15 font-medium">
                Powered by
              </span>
              <a href={brandUrl} className="flex items-center gap-1 group">
                <Music2 className="w-3 h-3 text-bs-primary-400/40 group-hover:text-bs-primary-400 transition-colors" />
                <span className="text-[11px] font-semibold text-bs-primary-400/40 group-hover:text-bs-primary-400 transition-colors">
                  band.stream
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
