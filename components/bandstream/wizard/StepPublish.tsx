'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Music,
  Palette,
  PartyPopper,
  Plus,
  Rocket,
  Share2,
} from 'lucide-react';

interface StepPublishProps {
  name: string;
  /** URL publique affichée, sans protocole (ex. artiste.band.stream/single) */
  urlLabel: string;
  platformCount: number;
  templateName: string;
  publishedUrl: string | null;
  publishing: boolean;
  onPublish: () => void;
  editHref: string;
  /** Relance le wizard pour une nouvelle sortie (smartlinks) */
  onCreateAnother?: () => void;
  /** Retour à l'espace artiste (smartlinks) */
  backHref?: string;
  backLabel?: string;
}

export default function StepPublish({
  name,
  urlLabel,
  platformCount,
  templateName,
  publishedUrl,
  publishing,
  onPublish,
  editHref,
  onCreateAnother,
  backHref,
  backLabel,
}: StepPublishProps) {
  const t = useTranslations('wizard');
  const [copied, setCopied] = useState(false);

  const liveUrl = publishedUrl ?? `https://${urlLabel}`;
  const canShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: select-less fallback is not worth it here
    }
  }

  if (publishedUrl) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-accent/10 text-green-accent">
          <PartyPopper className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold">{t('published_title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('published_hint')}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 font-mono text-sm break-all">
          {publishedUrl}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button type="button" onClick={copyUrl} variant="default">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" /> {t('copied')}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" /> {t('copy_link')}
              </>
            )}
          </Button>

          {canShare && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigator.share({ title: name, url: publishedUrl }).catch(() => {})
              }
            >
              <Share2 className="h-4 w-4 mr-2" /> {t('share')}
            </Button>
          )}

          <Button asChild variant="outline">
            <a href={publishedUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> {t('view_page')}
            </a>
          </Button>
        </div>

        {onCreateAnother && (
          <div>
            <Button type="button" variant="outline" onClick={onCreateAnother}>
              <Plus className="h-4 w-4 mr-2" />
              {t('create_another')}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 text-sm">
          <Link
            href={editHref}
            className="text-muted-foreground underline hover:text-foreground"
          >
            {t('continue_editing')}
          </Link>
          {backHref && (
            <Link
              href={backHref}
              className="text-muted-foreground underline hover:text-foreground"
            >
              {backLabel ?? t('back')}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{t('publish_recap_hint')}</p>

      <ul className="space-y-3">
        <li className="flex items-center gap-3 text-sm">
          <Music className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium">{name}</span>
        </li>
        <li className="flex items-center gap-3 text-sm">
          <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-mono">{urlLabel}</span>
        </li>
        <li className="flex items-center gap-3 text-sm">
          <Check className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{t('recap_platforms', { count: platformCount })}</span>
        </li>
        <li className="flex items-center gap-3 text-sm">
          <Palette className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{t('recap_template', { template: templateName })}</span>
        </li>
      </ul>

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={publishing}
        onClick={onPublish}
      >
        {publishing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('publishing')}
          </>
        ) : (
          <>
            <Rocket className="h-4 w-4 mr-2" /> {t('publish_now')}
          </>
        )}
      </Button>
    </div>
  );
}
