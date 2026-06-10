'use client';
/**
 * ┌─────────────────────────────────────────────┐
 * │  MODÈLE 01 — OBSIDIAN                       │
 * │  SmartLink page template                     │
 * │  Style : bfan.link / Believe                 │
 * │  Card centrée, fond artwork, boutons pill    │
 * └─────────────────────────────────────────────┘
 *
 * Dépendances :
 *   - react, framer-motion, lucide-react
 *   - tailwindcss (thème dark-950, bs-primary-400/500)
 *   - PlatformIcon (fourni dans le même dossier)
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, Music2 } from 'lucide-react';
import { PlatformIcon, PLATFORM_CONFIG } from '../PlatformIcon';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlatformEntry {
  platform: string;   // clé : 'spotify' | 'apple_music' | 'deezer' | …
  url: string;        // lien direct vers la plateforme
  action?: string;    // texte du CTA — défaut "Écouter"
}

export interface SmartLinkObsidianProps {
  title: string;
  artistName: string;
  subtitle?: string;
  thumbnailUrl: string;
  platforms: PlatformEntry[];
  /** Callback newsletter. Si absent, la section newsletter est masquée. */
  onNewsletterSubmit?: (email: string) => Promise<void> | void;
  /** URL du lien "Powered by". Défaut "/" */
  brandUrl?: string;
}

// ─── Animation variants ─────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};

// ─── Newsletter sub-component ───────────────────────────────────────────────

function NewsletterSignup({
  artistName,
  onSubmit,
}: {
  artistName: string;
  onSubmit: (email: string) => Promise<void> | void;
}) {
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-5 py-4 px-5 rounded-xl bg-white/[0.06] text-center"
      >
        <div className="w-9 h-9 bg-bs-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
          <Check className="w-4 h-4 text-bs-primary-400" />
        </div>
        <p className="text-sm font-medium text-white">Inscription confirmée !</p>
        <p className="text-xs text-white/50 mt-1">
          Vous recevrez les prochaines sorties de {artistName}.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} className="mt-5 py-4 px-5 rounded-xl bg-white/[0.06]">
      <div className="flex items-center gap-2 mb-1.5">
        <Mail className="w-3.5 h-3.5 text-white/60" aria-hidden="true" />
        <p className="text-[13px] font-medium text-white">Restez informé</p>
      </div>
      <p className="text-xs text-white/45 mb-3">
        Recevez les prochaines sorties de {artistName}.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
          className="flex-1 min-w-0 px-3 py-2 bg-white/[0.08] border border-white/10 rounded-full text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-white text-dark-950 text-sm font-semibold rounded-full hover:bg-white/90 disabled:opacity-50 transition-colors shrink-0"
        >
          {loading ? '...' : "S'inscrire"}
        </button>
      </form>
    </motion.div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function SmartLinkObsidian({
  title,
  artistName,
  subtitle,
  thumbnailUrl,
  platforms,
  onNewsletterSubmit,
  brandUrl = '/',
}: SmartLinkObsidianProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-dark-950">
      {/* ─── Background : artwork plein écran avec opacité ─── */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <img
          src={thumbnailUrl}
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/40 via-dark-950/60 to-dark-950/90" />
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 min-h-dvh flex flex-col items-center justify-center px-4 py-10">
        {/* relative + z-0 creates an explicit stacking context so the card
            stays stable relative to the fixed background layer after framer
            -motion finishes its initial transform. See #42 thread. */}
        <motion.div
          className="relative z-0 w-full max-w-[375px] mx-auto bg-white/[0.07] backdrop-blur-2xl rounded-[20px] p-6 sm:p-8 shadow-2xl shadow-black/30 border border-white/[0.08]"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* ─── Hero : Artwork + Infos ─── */}
          <motion.div variants={fadeUp} className="text-center mb-6">
            <img
              src={thumbnailUrl}
              alt={`${title} artwork`}
              className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-xl object-cover mx-auto shadow-xl shadow-black/50"
            />
            <h1 className="mt-5 text-[1.625rem] font-display font-bold text-white leading-tight tracking-tight">
              {title}
            </h1>
            <p className="mt-1 text-[15px] text-white/70 font-medium">
              {artistName}
            </p>
            {subtitle && (
              <p className="mt-2 text-xs text-white/40">{subtitle}</p>
            )}
          </motion.div>

          {/* ─── Boutons plateformes (pill) ─── */}
          <div className="space-y-2.5">
            {platforms.map((link) => {
              const config = PLATFORM_CONFIG[link.platform];
              const displayName = config?.name ?? link.platform;
              const actionLabel = link.action ?? 'Écouter';

              return (
                <motion.a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeIn}
                  className="group flex items-center gap-3 w-full py-2.5 px-4 rounded-full border border-white/15 hover:border-white/30 hover:bg-white/[0.06] transition-all duration-200"
                >
                  {/* Icône plateforme ronde */}
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <PlatformIcon platform={link.platform} size={18} />
                  </div>

                  {/* Nom plateforme */}
                  <span className="flex-1 text-[14px] font-medium text-white/90 group-hover:text-white transition-colors">
                    {displayName}
                  </span>

                  {/* Label action */}
                  <span className="text-[13px] font-semibold text-white/60 group-hover:text-white transition-colors">
                    {actionLabel}
                  </span>
                </motion.a>
              );
            })}
          </div>

          {/* ─── Newsletter (optionnel) ─── */}
          {onNewsletterSubmit && (
            <NewsletterSignup
              artistName={artistName}
              onSubmit={onNewsletterSubmit}
            />
          )}
        </motion.div>

        {/* ─── Footer ─── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-center gap-1.5 mt-6"
        >
          <span className="text-[10px] uppercase tracking-widest text-white/25 font-medium">
            Powered by
          </span>
          <a href={brandUrl} className="flex items-center gap-1 group">
            <Music2 className="w-3 h-3 text-bs-primary-400/60 group-hover:text-bs-primary-400 transition-colors" />
            <span className="text-[11px] font-semibold text-bs-primary-400/60 group-hover:text-bs-primary-400 transition-colors">
              Bandstream
            </span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
