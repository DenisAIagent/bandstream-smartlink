'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X } from 'lucide-react';

export type DomainStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'reserved'
  | 'invalid';

interface StepNameProps {
  name: string;
  slug: string;
  onNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
  domainStatus: DomainStatus;
  suggestion: string | null;
  onDomainStatus: (status: DomainStatus, suggestion: string | null) => void;
  /** The band already exists (user came back to this step) */
  currentSlug: string | null;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export default function StepName({
  name,
  slug,
  onNameChange,
  onSlugChange,
  domainStatus,
  suggestion,
  onDomainStatus,
  currentSlug,
}: StepNameProps) {
  const t = useTranslations('wizard');
  const [slugEdited, setSlugEdited] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced availability check
  useEffect(() => {
    if (!slug) {
      onDomainStatus('idle', null);
      return;
    }

    // Unchanged slug of an already-created band is always "available"
    if (currentSlug && slug === currentSlug) {
      onDomainStatus('available', null);
      return;
    }

    onDomainStatus('checking', null);
    if (checkTimer.current) clearTimeout(checkTimer.current);

    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/dashboard/bands/check-domain?domainname=${encodeURIComponent(slug)}`
        );
        if (!res.ok) throw new Error('check failed');
        const data = await res.json();
        if (data.available) {
          onDomainStatus('available', null);
        } else {
          onDomainStatus(data.reason ?? 'taken', data.suggestion ?? null);
        }
      } catch {
        // Network hiccup: stay neutral, the POST will validate anyway
        onDomainStatus('idle', null);
      }
    }, 400);

    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, currentSlug]);

  const statusLine = () => {
    switch (domainStatus) {
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
            <X className="h-3 w-3" /> {t('invalid_slug')}
          </span>
        );
      default:
        return <span className="text-muted-foreground">{t('subdomain_hint')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="wizard-name">{t('name_label')}</Label>
        <Input
          id="wizard-name"
          value={name}
          placeholder={t('name_placeholder')}
          autoFocus
          onChange={(e) => {
            onNameChange(e.target.value);
            if (!slugEdited) {
              onSlugChange(slugify(e.target.value));
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wizard-slug">{t('subdomain_label')}</Label>
        <div className="flex items-center gap-0">
          <Input
            id="wizard-slug"
            value={slug}
            className="rounded-r-none font-mono text-sm"
            onChange={(e) => {
              setSlugEdited(true);
              onSlugChange(slugify(e.target.value));
            }}
          />
          <span className="h-9 inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-sm text-muted-foreground whitespace-nowrap">
            .band.stream
          </span>
        </div>
        <p className="text-xs min-h-4">{statusLine()}</p>
      </div>
    </div>
  );
}
