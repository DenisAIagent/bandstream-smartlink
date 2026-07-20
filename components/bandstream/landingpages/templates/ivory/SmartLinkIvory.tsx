'use client';
/**
 * ┌─────────────────────────────────────────────┐
 * │  MODÈLE 04 — IVORY by Bandstream            │
 * │  SmartLink propriétaire Bandstream           │
 * │  Thème clair / light mode                    │
 * │  Fond blanc, boutons soft, ombres douces     │
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

export interface SmartLinkIvoryProps {
  title: string;
  artistName: string;
  subtitle?: string;
  thumbnailUrl: string;
  platforms: PlatformEntry[];
  socials?: SocialLink[];
  onNewsletterSubmit?: (email: string) => Promise<void> | void;
  brandUrl?: string;
  accentColor?: string;
}

// ─── Animations ─────────────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
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
    try { await onSubmit(email.trim()); } finally { setSubmitted(true); setLoading(false); }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-neutral-50 border border-neutral-100"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}15` }}>
          <Check className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900">Inscription confirmée</p>
          <p className="text-xs text-neutral-400">Vous serez notifié des prochaines sorties.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl bg-neutral-50 border border-neutral-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-5 py-4 hover:bg-neutral-100/60 transition-colors"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}12` }}>
          <Mail className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-neutral-800">Newsletter</p>
          <p className="text-xs text-neutral-400">Sorties de {artistName}</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-neutral-300 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
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
                className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-shadow"
                style={{ focusRingColor: accentColor } as unknown as React.CSSProperties}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:brightness-110 shrink-0 shadow-sm"
                style={{ backgroundColor: accentColor }}
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

// ─── Primary CTA ────────────────────────────────────────────────────────────

function PrimaryCTA({ link }: { link: PlatformEntry }) {
  const config = PLATFORM_CONFIG[link.platform];
  const displayName = config?.name ?? link.platform;
  const color = config?.color ?? '#888';
  const actionLabel = link.action ?? 'Écouter';

  return (
    <motion.a
      variants={slideUp}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-4 w-full py-4 px-5 rounded-2xl text-white overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-xl shadow-lg"
      style={{ backgroundColor: color, boxShadow: `0 8px 24px -8px ${color}50` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <PlatformIcon platform={link.platform} size={22} color="#ffffff" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[15px] font-bold block">{displayName}</span>
        <span className="text-xs text-white/70">{actionLabel} maintenant</span>
      </div>
      <Play className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
    </motion.a>
  );
}

// ─── Secondary button ───────────────────────────────────────────────────────

function SecondaryBtn({ link }: { link: PlatformEntry }) {
  const config = PLATFORM_CONFIG[link.platform];
  const displayName = config?.name ?? link.platform;
  const color = config?.color ?? '#888';
  const actionLabel = link.action ?? 'Écouter';

  return (
    <motion.a
      variants={slideUp}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 w-full py-3 px-4 rounded-2xl bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-md shadow-sm transition-all duration-200"
    >
      <div
        className="w-1 h-8 rounded-full shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}10` }}
      >
        <PlatformIcon platform={link.platform} size={18} />
      </div>
      <span className="flex-1 text-[14px] font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
        {displayName}
      </span>
      <span className="text-xs font-semibold text-neutral-300 group-hover:text-neutral-500 uppercase tracking-wide transition-colors">
        {actionLabel}
      </span>
    </motion.a>
  );
}

// ─── Social icons ───────────────────────────────────────────────────────────

function Socials({ links }: { links: SocialLink[] }) {
  return (
    <motion.div variants={slideUp} className="flex items-center justify-center gap-2.5">
      {links.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          {s.icon ?? <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />}
        </a>
      ))}
    </motion.div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function SmartLinkIvory({
  title,
  artistName,
  subtitle,
  thumbnailUrl,
  platforms,
  socials,
  onNewsletterSubmit,
  brandUrl = '/',
  accentColor,
}: SmartLinkIvoryProps) {
  const accent = accentColor ?? PLATFORM_CONFIG[platforms[0]?.platform ?? '']?.color ?? '#0ED894';

  return (
    <div className="min-h-dvh bg-[#FAFAF9] text-neutral-900">
      {/* ─── Fond subtil : teinte d'accent en haut ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 left-0 right-0 h-[60vh] opacity-[0.04]"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent} 0%, transparent 70%)` }}
        />
      </div>

      <div className="relative z-10 min-h-dvh">
        <div className="min-h-dvh flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-14 lg:px-8 lg:py-12 max-w-[960px] mx-auto">

          {/* ─── Artwork ─── */}
          <motion.div variants={scaleIn} initial="hidden" animate="visible" className="lg:w-[400px] shrink-0">
            {/* Mobile */}
            <div className="lg:hidden relative">
              <div className="px-8 pt-8 pb-4">
                <img
                  src={thumbnailUrl}
                  alt={`${title} artwork`}
                  className="w-full aspect-square rounded-3xl object-cover shadow-xl shadow-neutral-200/80"
                />
              </div>
            </div>
            {/* Desktop */}
            <div className="hidden lg:block relative">
              <div
                className="absolute -inset-6 rounded-[28px] blur-3xl opacity-[0.12]"
                style={{ backgroundColor: accent }}
              />
              <img
                src={thumbnailUrl}
                alt={`${title} artwork`}
                className="relative w-full aspect-square rounded-2xl object-cover shadow-2xl shadow-neutral-300/60 ring-1 ring-black/[0.04]"
              />
            </div>
          </motion.div>

          {/* ─── Content ─── */}
          {/* relative + z-0 creates an explicit stacking context to keep
              paint order stable relative to the fixed background after
              framer-motion's initial transform is cleared. See #42. */}
          <motion.div
            className="relative z-0 flex-1 min-w-0 px-6 pb-10 lg:px-0 lg:max-w-[420px]"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* Title */}
            <motion.div variants={slideUp} className="mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-display font-bold leading-tight tracking-tight text-neutral-900">
                {title}
              </h1>
              <p className="mt-1.5 text-base lg:text-lg text-neutral-400 font-medium">
                {artistName}
              </p>
              {subtitle && (
                <p className="mt-2 text-sm text-neutral-300">{subtitle}</p>
              )}
            </motion.div>

            {/* Platforms */}
            <div className="space-y-2.5 mb-5">
              {platforms.map((link, i) =>
                i === 0 ? (
                  <PrimaryCTA key={link.platform} link={link} />
                ) : (
                  <SecondaryBtn key={link.platform} link={link} />
                )
              )}
            </div>

            {/* Newsletter */}
            {onNewsletterSubmit && (
              <motion.div variants={slideUp} className="mb-5">
                <Newsletter artistName={artistName} accentColor={accent} onSubmit={onNewsletterSubmit} />
              </motion.div>
            )}

            {/* Socials */}
            {socials && socials.length > 0 && (
              <Socials links={socials} />
            )}

            {/* Footer */}
            <motion.div
              variants={slideUp}
              className="flex items-center justify-center lg:justify-start gap-1.5 mt-8"
            >
              <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-300 font-medium">
                Powered by
              </span>
              <a href={brandUrl} className="flex items-center gap-1 group">
                <Music2 className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                <span className="text-[11px] font-semibold text-neutral-300 group-hover:text-neutral-500 transition-colors">
                  Bandstream
                </span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
