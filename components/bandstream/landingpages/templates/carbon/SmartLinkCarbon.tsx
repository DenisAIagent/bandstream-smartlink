'use client';
/**
 * ┌─────────────────────────────────────────────┐
 * │  MODÈLE 05 — CARBON by Bandstream           │
 * │  SmartLink propriétaire Bandstream           │
 * │  Fond noir + artwork en background           │
 * │  Boutons blancs/gris anthracite              │
 * └─────────────────────────────────────────────┘
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Music2, ChevronRight, ExternalLink } from 'lucide-react';
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

export interface SmartLinkCarbonProps {
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
  onSubmit,
}: {
  artistName: string;
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.08]">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/10">
          <Check className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Inscription confirmée</p>
          <p className="text-xs text-white/40">Vous serez notifié des prochaines sorties.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.08] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-3 w-full px-5 py-4 hover:bg-white/[0.04] transition-colors">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/10">
          <Mail className="w-4 h-4 text-white/60" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-white/90">Newsletter</p>
          <p className="text-xs text-white/35">Sorties de {artistName}</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-white/20 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} onSubmit={handleSubmit} className="overflow-hidden">
            <div className="px-5 pb-4 flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required autoFocus
                className="flex-1 min-w-0 px-4 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
              <button type="submit" disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black disabled:opacity-50 transition-all hover:bg-white/90 shrink-0">
                {loading ? '...' : 'OK'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function SmartLinkCarbon({
  title,
  artistName,
  subtitle,
  thumbnailUrl,
  platforms,
  socials,
  onNewsletterSubmit,
  brandUrl = '/',
  accentColor,
}: SmartLinkCarbonProps) {
  const accent = accentColor ?? PLATFORM_CONFIG[platforms[0]?.platform ?? '']?.color ?? '#0ED894';

  return (
    <div className="min-h-dvh bg-black text-white">
      {/* ─── Fond : artwork plein écran ─── */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <img src={thumbnailUrl} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-10 min-h-dvh">
        <div className="min-h-dvh flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-14 lg:px-8 lg:py-12 max-w-[960px] mx-auto">

          {/* ─── Artwork ─── */}
          <motion.div variants={scaleIn} initial="hidden" animate="visible" className="lg:w-[400px] shrink-0">
            {/* Mobile */}
            <div className="lg:hidden px-8 pt-8 pb-4">
              <img src={thumbnailUrl} alt={`${title} artwork`} className="w-full aspect-square rounded-3xl object-cover shadow-2xl shadow-black/80" />
            </div>
            {/* Desktop */}
            <div className="hidden lg:block relative">
              <div className="absolute -inset-6 rounded-[28px] blur-3xl opacity-[0.08]" style={{ backgroundColor: accent }} />
              <img src={thumbnailUrl} alt={`${title} artwork`} className="relative w-full aspect-square rounded-2xl object-cover shadow-2xl shadow-black/60 ring-1 ring-white/[0.06]" />
            </div>
          </motion.div>

          {/* ─── Content ─── */}
          {/* relative + z-0 creates an explicit stacking context to keep
              paint order stable relative to the fixed background after
              framer-motion's initial transform is cleared. See #42. */}
          <motion.div className="relative z-0 flex-1 min-w-0 px-6 pb-10 lg:px-0 lg:max-w-[420px]" variants={stagger} initial="hidden" animate="visible">
            {/* Title */}
            <motion.div variants={slideUp} className="mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-display font-bold leading-tight tracking-tight text-white">
                {title}
              </h1>
              <p className="mt-1.5 text-base lg:text-lg text-white/40 font-medium">{artistName}</p>
              {subtitle && <p className="mt-2 text-sm text-white/25">{subtitle}</p>}
            </motion.div>

            {/* Boutons plateformes : blancs/gris anthracite */}
            <div className="space-y-2.5 mb-5">
              {platforms.map((link) => {
                const config = PLATFORM_CONFIG[link.platform];
                const displayName = config?.name ?? link.platform;
                const color = config?.color ?? '#888';
                const actionLabel = link.action ?? 'Écouter';

                return (
                  <motion.a key={link.platform} variants={slideUp} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-3 w-full py-3.5 px-5 rounded-2xl bg-neutral-100/90 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="w-1 h-8 rounded-full shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color }} />
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}12` }}>
                      <PlatformIcon platform={link.platform} size={18} />
                    </div>
                    <span className="flex-1 text-[14px] font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">{displayName}</span>
                    <span className="text-xs font-semibold text-neutral-400 group-hover:text-neutral-600 uppercase tracking-wide transition-colors">{actionLabel}</span>
                  </motion.a>
                );
              })}
            </div>

            {/* Newsletter */}
            {onNewsletterSubmit && (
              <motion.div variants={slideUp} className="mb-5">
                <Newsletter artistName={artistName} onSubmit={onNewsletterSubmit} />
              </motion.div>
            )}

            {/* Socials */}
            {socials && socials.length > 0 && (
              <motion.div variants={slideUp} className="flex items-center justify-center lg:justify-start gap-2.5 mb-8">
                {socials.map((s) => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}
                    className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-all duration-200 hover:scale-110">
                    {s.icon ?? <ExternalLink className="w-3.5 h-3.5 text-white/30" />}
                  </a>
                ))}
              </motion.div>
            )}

            {/* Footer */}
            <motion.div variants={slideUp} className="flex items-center justify-center lg:justify-start gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-white/15 font-medium">Powered by</span>
              <a href={brandUrl} className="flex items-center gap-1 group">
                <Music2 className="w-3 h-3 text-white/15 group-hover:text-white/40 transition-colors" />
                <span className="text-[11px] font-semibold text-white/15 group-hover:text-white/40 transition-colors">band.stream</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
