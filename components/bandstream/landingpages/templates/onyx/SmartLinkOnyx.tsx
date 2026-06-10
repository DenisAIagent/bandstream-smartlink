'use client';
/**
 * ┌─────────────────────────────────────────────┐
 * │  MODÈLE 02 — ONYX                           │
 * │  SmartLink page template                     │
 * │  Style : ffm.to / Feature.fm                 │
 * │  Desktop = split view, Mobile = stacked      │
 * │  Boutons remplis couleur plateforme           │
 * └─────────────────────────────────────────────┘
 *
 * Dépendances :
 *   - react, framer-motion, lucide-react
 *   - tailwindcss (thème dark + primary)
 *   - PlatformIcon (fourni dans le même dossier)
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, Music2, ExternalLink } from 'lucide-react';
import { PlatformIcon, PLATFORM_CONFIG } from '../PlatformIcon';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlatformEntry {
  platform: string;
  url: string;
  action?: string; // défaut "Écouter"
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: React.ReactNode;
}

export interface SmartLinkOnyxProps {
  title: string;
  artistName: string;
  subtitle?: string;
  thumbnailUrl: string;
  platforms: PlatformEntry[];
  socials?: SocialLink[];
  onNewsletterSubmit?: (email: string) => Promise<void> | void;
  brandUrl?: string;
}

// ─── Animation ──────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── Newsletter (inline button style) ───────────────────────────────────────

function NewsletterButton({
  onSubmit,
}: {
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
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 w-full h-[58px] px-5 rounded-md bg-white"
      >
        <Check className="w-5 h-5 text-green-600 shrink-0" />
        <span className="text-sm font-semibold text-neutral-900">
          Inscription confirmée !
        </span>
      </motion.div>
    );
  }

  if (!open) {
    return (
      <motion.button
        variants={fadeUp}
        onClick={() => setOpen(true)}
        className="group flex items-center gap-3 w-full h-[58px] px-5 rounded-md bg-white hover:bg-neutral-100 transition-all duration-150 hover:scale-[1.02] hover:shadow-lg"
      >
        <Mail className="w-5 h-5 text-neutral-900 shrink-0" />
        <span className="flex-1 text-left text-sm font-semibold text-neutral-900">
          S'inscrire à la newsletter
        </span>
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
          Sign Up
        </span>
      </motion.button>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      onSubmit={handleSubmit}
      className="w-full rounded-md bg-white p-4 space-y-3"
    >
      <p className="text-sm font-semibold text-neutral-900">
        Entrez votre email
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.com"
        required
        autoFocus
        className="w-full px-3 py-2.5 bg-neutral-100 border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-colors"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : "S'inscrire"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2.5 bg-neutral-100 text-neutral-600 text-sm font-medium rounded-md hover:bg-neutral-200 transition-colors"
        >
          Annuler
        </button>
      </div>
    </motion.form>
  );
}

// ─── Platform button (rempli avec couleur) ──────────────────────────────────

function PlatformButton({ link }: { link: PlatformEntry }) {
  const config = PLATFORM_CONFIG[link.platform];
  const displayName = config?.name ?? link.platform;
  const color = config?.color ?? '#555';
  const actionLabel = link.action ?? 'Écouter';

  // Texte clair ou foncé selon la luminosité du fond
  const isLight =
    link.platform === 'tidal' ||
    color === '#000000';
  const textClass = isLight ? 'text-white' : 'text-white';

  return (
    <motion.a
      variants={fadeUp}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 w-full h-[58px] px-5 rounded-md transition-all duration-150 hover:scale-[1.02] hover:shadow-lg"
      style={{ backgroundColor: color }}
    >
      <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center shrink-0">
        <PlatformIcon platform={link.platform} size={20} color="#ffffff" />
      </div>
      <span className={`flex-1 text-sm font-semibold ${textClass}`}>
        {displayName}
      </span>
      <span className={`text-xs font-bold uppercase tracking-wide ${textClass} opacity-70`}>
        {actionLabel}
      </span>
    </motion.a>
  );
}

// ─── Social icons ───────────────────────────────────────────────────────────

function SocialIcons({ socials }: { socials: SocialLink[] }) {
  return (
    <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mt-6">
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          {s.icon ?? (
            <ExternalLink className="w-4 h-4 text-white/60" />
          )}
        </a>
      ))}
    </motion.div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function SmartLinkOnyx({
  title,
  artistName,
  subtitle,
  thumbnailUrl,
  platforms,
  socials,
  onNewsletterSubmit,
  brandUrl = '/',
}: SmartLinkOnyxProps) {
  return (
    <div className="min-h-dvh bg-[#2e2e2e] text-white">
      <div className="min-h-dvh flex flex-col">
        {/* ─── Main content ─── */}
        <div className="flex-1 flex flex-col lg:flex-row max-w-[848px] mx-auto w-full lg:my-10 lg:rounded-md lg:overflow-hidden lg:shadow-2xl lg:shadow-black/40">

          {/* ─── Left: Artwork ─── */}
          <div className="lg:w-[424px] shrink-0">
            <div className="relative w-full aspect-square lg:aspect-auto lg:h-full">
              <img
                src={thumbnailUrl}
                alt={`${title} artwork`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* ─── Right: Content ─── */}
          <div className="flex-1 flex flex-col bg-[#2e2e2e]">
            {/* Song info */}
            <div className="px-6 pt-6 pb-4 lg:px-8 lg:pt-8">
              <h1 className="text-lg sm:text-xl font-bold leading-tight line-clamp-3">
                {title}
              </h1>
              <p className="mt-1 text-sm text-white/60 font-medium">
                {artistName}
              </p>
              {subtitle && (
                <p className="mt-2 text-xs text-white/40">{subtitle}</p>
              )}
            </div>

            {/* Platform buttons */}
            <motion.div
              className="flex-1 px-6 pb-6 lg:px-8 lg:pb-8 space-y-3"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              {/* Newsletter en premier (comme ffm.to) */}
              {onNewsletterSubmit && (
                <NewsletterButton onSubmit={onNewsletterSubmit} />
              )}

              {platforms.map((link) => (
                <PlatformButton key={link.platform} link={link} />
              ))}
            </motion.div>

            {/* Socials */}
            {socials && socials.length > 0 && (
              <div className="px-6 pb-4 lg:px-8">
                <SocialIcons socials={socials} />
              </div>
            )}
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="py-4 flex items-center justify-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-white/20 font-medium">
            Powered by
          </span>
          <a href={brandUrl} className="flex items-center gap-1 group">
            <Music2 className="w-3 h-3 text-bs-primary-400/50 group-hover:text-bs-primary-400 transition-colors" />
            <span className="text-[11px] font-semibold text-bs-primary-400/50 group-hover:text-bs-primary-400 transition-colors">
              Bandstream
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
