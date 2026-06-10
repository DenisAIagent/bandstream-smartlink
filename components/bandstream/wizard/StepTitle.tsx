'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X } from 'lucide-react';
import type { DomainStatus } from './StepName';

interface StepTitleProps {
  title: string;
  slug: string;
  bandId: number;
  domainname: string;
  apiBase: string;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  slugStatus: DomainStatus;
  suggestion: string | null;
  onSlugStatus: (status: DomainStatus, suggestion: string | null) => void;
  /** Slug déjà enregistré (retour sur l'étape) */
  currentSlug: string | null;
}

export function slugifyTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

export default function StepTitle({
  title,
  slug,
  bandId,
  domainname,
  apiBase,
  onTitleChange,
  onSlugChange,
  slugStatus,
  suggestion,
  onSlugStatus,
  currentSlug,
}: StepTitleProps) {
  const t = useTranslations('wizard');
  const tsl = useTranslations('smartlinks');
  const [slugEdited, setSlugEdited] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!slug) {
      onSlugStatus('idle', null);
      return;
    }

    if (currentSlug && slug === currentSlug) {
      onSlugStatus('available', null);
      return;
    }

    onSlugStatus('checking', null);
    if (checkTimer.current) clearTimeout(checkTimer.current);

    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiBase}/bands/${bandId}/smartlinks/check-slug?slug=${encodeURIComponent(slug)}`
        );
        if (!res.ok) throw new Error('check failed');
        const data = await res.json();
        if (data.available) {
          onSlugStatus('available', null);
        } else {
          onSlugStatus(data.reason ?? 'taken', data.suggestion ?? null);
        }
      } catch {
        onSlugStatus('idle', null);
      }
    }, 400);

    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, currentSlug]);

  const statusLine = () => {
    switch (slugStatus) {
      case 'checking':
        return (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> {t('checking')}
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-500">
            <Check className="h-3 w-3" /> {t('available')}
          </span>
        );
      case 'taken':
        return (
          <span className="inline-flex items-center gap-1 text-destructive">
            <X className="h-3 w-3" /> {t('taken')}
            {suggestion && (
              <button
                type="button"
                className="underline ml-1"
                onClick={() => onSlugChange(suggestion)}
              >
                {t('try_suggestion', { suggestion })}
              </button>
            )}
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1 text-destructive">
            <X className="h-3 w-3" /> {t('reserved')}
          </span>
        );
      case 'invalid':
        return (
          <span className="inline-flex items-center gap-1 text-destructive">
            <X className="h-3 w-3" /> {tsl('slug_hint')}
          </span>
        );
      default:
        return <span className="text-muted-foreground">{tsl('slug_hint')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="wizard-sl-title">{tsl('title_label')}</Label>
        <Input
          id="wizard-sl-title"
          value={title}
          placeholder={tsl('title_placeholder')}
          autoFocus
          onChange={(e) => {
            onTitleChange(e.target.value);
            if (!slugEdited) {
              onSlugChange(slugifyTitle(e.target.value));
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wizard-sl-slug">{tsl('slug_label')}</Label>
        <div className="flex items-center gap-0">
          <span className="h-9 inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-xs text-muted-foreground whitespace-nowrap">
            {domainname}.band.stream/
          </span>
          <Input
            id="wizard-sl-slug"
            value={slug}
            className="rounded-l-none font-mono text-sm"
            onChange={(e) => {
              setSlugEdited(true);
              onSlugChange(
                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
              );
            }}
          />
        </div>
        <p className="text-xs min-h-4">{statusLine()}</p>
      </div>
    </div>
  );
}
