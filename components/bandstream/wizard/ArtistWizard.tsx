'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, Music, PartyPopper, Sparkles } from 'lucide-react';
import StepName, { type DomainStatus } from './StepName';

interface ArtistWizardProps {
  /** Where "Continuer l'édition" points to, without the band id */
  editBasePath: '/dashboard/bands' | '/admin/bands/edit';
}

/**
 * Création d'un ARTISTE : nom + sous-domaine, puis CTA vers la création
 * de son premier smartlink (le contenu — sorties, liens, design — vit
 * désormais au niveau des smartlinks).
 */
export default function ArtistWizard({ editBasePath }: ArtistWizardProps) {
  const t = useTranslations('wizard');
  const tsl = useTranslations('smartlinks');

  const [busy, setBusy] = useState(false);
  const [limitReached, setLimitReached] = useState<number | null>(null);
  const [bandId, setBandId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domainStatus, setDomainStatus] = useState<DomainStatus>('idle');
  const [suggestion, setSuggestion] = useState<string | null>(null);

  // Le wizard de smartlink n'existe que côté dashboard (v1) ; depuis
  // l'admin, le CTA renvoie vers la page d'édition admin du band.
  const isAdmin = editBasePath === '/admin/bands/edit';
  const firstSmartlinkHref = (id: number) =>
    isAdmin ? `/admin/bands/edit/${id}` : `/dashboard/bands/${id}/smartlinks/new`;
  const editHref = (id: number) =>
    isAdmin ? `/admin/bands/edit/${id}` : `/dashboard/bands/${id}`;

  const canCreate =
    !busy && name.trim().length > 0 && slug.length >= 3 && domainStatus === 'available';

  async function createArtist() {
    setBusy(true);
    try {
      const res = await fetch('/api/dashboard/bands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), domainname: slug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === 'plan_limit_artists') {
          setLimitReached(typeof data.limit === 'number' ? data.limit : 1);
          return;
        }
        const message =
          data.error === 'taken'
            ? t('taken')
            : data.error === 'reserved'
              ? t('reserved')
              : data.error === 'invalid'
                ? t('invalid_slug')
                : t('error_generic');
        throw new Error(message);
      }
      const band = await res.json();
      setBandId(band.id);
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : t('error_generic'),
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }

  // Limite d'artistes du plan atteinte
  if (limitReached !== null) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10 sm:pt-16">
        <div className="rounded-xl border border-primary/30 bg-card text-center space-y-3 py-8 px-6">
          <Sparkles className="h-6 w-6 mx-auto text-primary" />
          <p className="font-semibold">{t('artist_limit_title')}</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t('artist_limit_body', { limit: limitReached })}
          </p>
          <Link href="/dashboard/settings">
            <Button className="mt-2">{tsl('upgrade_cta')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Écran de succès : artiste créé → premier smartlink
  if (bandId !== null) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10 sm:pt-16">
        <div className="text-center space-y-6 py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-accent/10 text-green-accent">
            <PartyPopper className="h-8 w-8" />
          </div>

          <div>
            <h1 className="text-xl font-bold">{t('artist_done_title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('artist_done_hint')}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 font-mono text-sm break-all">
            {slug}.band.stream
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild size="lg">
              <Link href={firstSmartlinkHref(bandId)}>
                <Music className="h-4 w-4 mr-2" />
                {t('first_smartlink_cta')}
              </Link>
            </Button>
          </div>

          <div>
            <Link
              href={editHref(bandId)}
              className="text-sm text-muted-foreground underline hover:text-foreground"
            >
              {t('continue_editing')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-28 pt-6 sm:pt-10">
      <nav aria-label={t('title')} className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">{t('step_name')}</h1>
      </nav>

      <StepName
        name={name}
        slug={slug}
        onNameChange={setName}
        onSlugChange={setSlug}
        domainStatus={domainStatus}
        suggestion={suggestion}
        onDomainStatus={(status, sug) => {
          setDomainStatus(status);
          setSuggestion(sug);
        }}
        currentSlug={null}
      />

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto flex items-center justify-end">
          <Button type="button" disabled={!canCreate} onClick={createArtist}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {t('next')} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
