'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { getPlatformIcon } from '@/components/bandstream/landingpages/PlatformIcons';
import { Loader2, Sparkles } from 'lucide-react';
import type { WizardPlatform } from './types';

interface StepPlatformsProps {
  platformUrls: Record<number, string>;
  onChange: (platformUrls: Record<number, string>) => void;
  platforms: WizardPlatform[];
  onPlatformsLoaded: (platforms: WizardPlatform[]) => void;
}

/**
 * Validate a pasted URL against the platform base URL.
 * - hôte identique à la base → chemin relatif (convention customURL) ;
 * - sous-domaine de la base (ex. {artiste}.bandcamp.com, listen.tidal.com)
 *   → URL COMPLÈTE conservée (le sous-domaine porte de l'information,
 *   les renderers gèrent les customURL absolues) ;
 * - hôte étranger → null (lien invalide pour cette plateforme).
 */
export function extractCustomURL(
  pasted: string,
  platformBaseURL: string
): string | null {
  try {
    const input = new URL(pasted.trim());
    const base = new URL(platformBaseURL);
    const inputHost = input.hostname.replace(/^www\./, '');
    const baseHost = base.hostname.replace(/^www\./, '');

    if (inputHost === baseHost) {
      const path = `${input.pathname}${input.search}`.replace(/^\/+/, '');
      return path || null;
    }
    if (inputHost.endsWith(`.${baseHost}`)) {
      return input.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export default function StepPlatforms({
  platformUrls,
  onChange,
  platforms,
  onPlatformsLoaded,
}: StepPlatformsProps) {
  const t = useTranslations('wizard');
  const [loading, setLoading] = useState(platforms.length === 0);
  const [errors, setErrors] = useState<Record<number, boolean>>({});
  const [autofillUrl, setAutofillUrl] = useState('');
  const [autofilling, setAutofilling] = useState(false);

  /** Odesli : un lien de titre/album → tous les liens de plateformes. */
  async function autofill() {
    setAutofilling(true);
    try {
      const res = await fetch('/api/dashboard/odesli/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: autofillUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          title:
            data.error === 'unresolvable_url'
              ? t('autofill_unresolvable')
              : t('autofill_failed'),
          variant: 'destructive',
        });
        return;
      }

      const resolved: {
        platformId: number;
        shortname: string;
        name: string;
        baseURL: string;
        url: string;
      }[] = data.links ?? [];

      if (resolved.length === 0) {
        toast({ title: t('autofill_unresolvable'), variant: 'destructive' });
        return;
      }

      // Plateformes absentes de la liste affichée (créées à la volée côté API)
      const knownIds = new Set(platforms.map((p) => p.id));
      const newPlatforms = resolved
        .filter((l) => !knownIds.has(l.platformId))
        .map((l) => ({
          id: l.platformId,
          name: l.name,
          shortname: l.shortname,
          logo: null,
          URL: l.baseURL,
        }));
      if (newPlatforms.length > 0) {
        onPlatformsLoaded([...platforms, ...newPlatforms]);
      }

      // Pré-remplit les champs (sans écraser une saisie manuelle existante)
      const next = { ...platformUrls };
      for (const link of resolved) {
        if (!next[link.platformId]) {
          next[link.platformId] = link.url;
        }
      }
      onChange(next);
      setErrors({});
      setAutofillUrl('');
      toast({ title: t('autofill_done', { count: resolved.length }) });
    } catch (error) {
      console.error('Autofill error:', error);
      toast({ title: t('autofill_failed'), variant: 'destructive' });
    } finally {
      setAutofilling(false);
    }
  }

  useEffect(() => {
    if (platforms.length > 0) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/dashboard/platforms');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        if (!cancelled) onPlatformsLoaded(data);
      } catch (e) {
        console.error('Failed to load platforms:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setUrl(platformId: number, url: string, baseURL: string) {
    const next = { ...platformUrls };
    if (url.trim() === '') {
      delete next[platformId];
      setErrors((prev) => ({ ...prev, [platformId]: false }));
    } else {
      next[platformId] = url;
      const valid = extractCustomURL(url, baseURL) !== null;
      setErrors((prev) => ({ ...prev, [platformId]: !valid }));
    }
    onChange(next);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> {t('loading_platforms')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Auto-remplissage Odesli : un lien → toutes les plateformes */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm font-medium">{t('autofill_title')}</p>
        </div>
        <p className="text-xs text-muted-foreground">{t('autofill_hint')}</p>
        <div className="flex gap-2">
          <Input
            type="url"
            inputMode="url"
            value={autofillUrl}
            placeholder="https://open.spotify.com/album/…"
            disabled={autofilling}
            onChange={(e) => setAutofillUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && autofillUrl.trim()) autofill();
            }}
          />
          <Button
            type="button"
            disabled={autofilling || !autofillUrl.trim()}
            onClick={autofill}
          >
            {autofilling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t('autofill_button')}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{t('platforms_hint')}</p>

      {platforms.map((platform) => {
        const iconData = getPlatformIcon(platform.shortname);
        const value = platformUrls[platform.id] ?? '';
        const hasError = errors[platform.id] && value !== '';
        return (
          <div
            key={platform.id}
            className="rounded-lg border border-border p-3 space-y-2"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                style={{
                  background: iconData.bgColor,
                  border: iconData.border ? '1px solid #2a2a2a' : undefined,
                }}
              >
                {iconData.icon}
              </div>
              <span className="text-sm font-medium">{platform.name}</span>
            </div>
            <Input
              type="url"
              inputMode="url"
              value={value}
              placeholder={`${platform.URL}/...`}
              aria-label={platform.name}
              className={hasError ? 'border-destructive' : ''}
              onChange={(e) => setUrl(platform.id, e.target.value, platform.URL)}
            />
            {hasError && (
              <p className="text-xs text-destructive">
                {t('url_invalid_for_platform', { platform: platform.name })}
              </p>
            )}
          </div>
        );
      })}

      {platforms.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t('no_platforms_available')}
        </p>
      )}
    </div>
  );
}
