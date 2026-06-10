'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SmartLinkCard, { type SmartLinkListItem } from './SmartLinkCard';

interface SmartLinksPanelProps {
  bandId: number;
  domainname: string;
  /** '/api/dashboard' ou '/api/admin' */
  apiBase: string;
  /** Base des liens d'édition : '/dashboard/bands' ou '/admin/bands/edit' */
  editBasePath: string;
}

/**
 * Liste des smartlinks d'un artiste + bouton de création.
 * Réutilisé par l'espace artiste (dashboard) et l'édition admin.
 */
export default function SmartLinksPanel({
  bandId,
  domainname,
  apiBase,
  editBasePath,
}: SmartLinksPanelProps) {
  const t = useTranslations('smartlinks');
  const [smartLinks, setSmartLinks] = useState<SmartLinkListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSmartLinks = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/bands/${bandId}/smartlinks`);
      if (res.ok) setSmartLinks(await res.json());
    } catch (error) {
      console.error('Error fetching smartlinks:', error);
    } finally {
      setLoading(false);
    }
  }, [apiBase, bandId]);

  useEffect(() => {
    fetchSmartLinks();
  }, [fetchSmartLinks]);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href={`${editBasePath}/${bandId}/smartlinks/new`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('create')}
          </Button>
        </Link>
      </div>

      {smartLinks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('empty')}</p>
          <p className="text-sm mt-1">{t('empty_hint')}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {smartLinks.map((sl) => (
            <SmartLinkCard
              key={sl.id}
              bandId={bandId}
              domainname={domainname}
              smartLink={sl}
              editBasePath={editBasePath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
