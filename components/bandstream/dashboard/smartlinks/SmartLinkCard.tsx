'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, ExternalLink, Music } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface SmartLinkListItem {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  template: string;
  publishedAt: string | null;
  unpublishedAt: string | null;
  platformCount: number;
}

interface SmartLinkCardProps {
  bandId: number;
  domainname: string;
  smartLink: SmartLinkListItem;
  /** Base du lien d'édition (dashboard ou admin) */
  editBasePath: string;
}

export default function SmartLinkCard({
  bandId,
  domainname,
  smartLink,
  editBasePath,
}: SmartLinkCardProps) {
  const t = useTranslations('smartlinks');
  const td = useTranslations('dashboard');
  const [copied, setCopied] = useState(false);

  const liveUrl = `https://${domainname}.band.stream/${smartLink.slug}`;
  const isLive = Boolean(smartLink.publishedAt) && !smartLink.unpublishedAt;

  async function copyLink(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponible */
    }
  }

  return (
    <Link href={`${editBasePath}/${bandId}/smartlinks/${smartLink.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
            {smartLink.coverImage ? (
              <Image src={smartLink.coverImage} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{smartLink.title}</p>
              {!isLive && <Badge variant="secondary">{t('draft')}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground truncate font-mono">
              /{smartLink.slug}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {smartLink.platformCount} plateforme{smartLink.platformCount > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={copyLink}
              aria-label={td('copy_link')}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            {isLive && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                aria-label={t('view_live')}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(liveUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
