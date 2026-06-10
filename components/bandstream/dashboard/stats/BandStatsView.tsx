'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, Loader2, MousePointerClick, Users, Sparkles } from 'lucide-react';
import ViewsTimeSeriesChart from './ViewsTimeSeriesChart';
import PlatformClicksChart from './PlatformClicksChart';
import SourcesList from './SourcesList';

type Range = '7d' | '30d' | '90d';

interface StatsPayload {
  plan?: 'FREE' | 'PRO' | 'LABEL';
  pending?: boolean;
  reason?: string;
  summary?: { pageviews: number; visitors: number; visits: number; totalClicks: number };
  timeseries?: { date: string; views: number; sessions: number }[];
  platformClicks?: { platform: string; clicks: number }[];
  referrers?: { name: string; count: number }[];
  countries?: { name: string; count: number }[];
  devices?: { name: string; count: number }[];
}

interface BandStatsViewProps {
  bandId: number;
  bandName: string;
}

const RANGES: Range[] = ['7d', '30d', '90d'];

interface SmartLinkPill {
  id: number;
  title: string;
  slug: string;
  publishedAt: string | null;
}

export default function BandStatsView({ bandId, bandName }: BandStatsViewProps) {
  const t = useTranslations('stats');
  const tsl = useTranslations('smartlinks');
  const [range, setRange] = useState<Range>('7d');
  const [slug, setSlug] = useState<string | null>(null);
  const [smartLinks, setSmartLinks] = useState<SmartLinkPill[]>([]);
  const [data, setData] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/dashboard/bands/${bandId}/smartlinks`);
        if (res.ok) {
          const list: SmartLinkPill[] = await res.json();
          setSmartLinks(list.filter((sl) => sl.publishedAt));
        }
      } catch (e) {
        console.error('Failed to load smartlinks for stats:', e);
      }
    })();
  }, [bandId]);

  const fetchStats = useCallback(async (selected: Range, selectedSlug: string | null) => {
    setLoading(true);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris';
      const slugParam = selectedSlug ? `&slug=${encodeURIComponent(selectedSlug)}` : '';
      const res = await fetch(
        `/api/dashboard/bands/${bandId}/stats?range=${selected}&tz=${encodeURIComponent(tz)}${slugParam}`
      );
      if (!res.ok) throw new Error('stats fetch failed');
      setData(await res.json());
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({ title: t('load_error'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [bandId, t]);

  useEffect(() => {
    fetchStats(range, slug);
  }, [fetchStats, range, slug]);

  const summaryCards = data?.summary
    ? [
        { key: 'pageviews', icon: Eye, value: data.summary.pageviews },
        { key: 'visitors', icon: Users, value: data.summary.visitors },
        { key: 'clicks', icon: MousePointerClick, value: data.summary.totalClicks },
      ]
    : [];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold">
          {t('title', { name: bandName })}
        </h1>
        <div className="ml-auto flex rounded-md border border-border overflow-hidden">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(`range_${r}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Sélecteur par smartlink */}
      {smartLinks.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSlug(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              slug === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {tsl('stats_all')}
          </button>
          {smartLinks.map((sl) => (
            <button
              key={sl.id}
              type="button"
              onClick={() => setSlug(sl.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                slug === sl.slug
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {sl.title}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> {t('loading')}
        </div>
      ) : data?.pending ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {data.reason === 'unpublished'
              ? t('pending_publish')
              : t('pending_configuration')}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary cards — available on every plan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summaryCards.map(({ key, icon: Icon, value }) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Icon className="h-4 w-4" />
                    {t(key)}
                  </div>
                  <p className="text-3xl font-bold tabular-nums">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {data?.plan && data.plan !== 'FREE' ? (
            <>
              <ViewsTimeSeriesChart data={data.timeseries ?? []} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PlatformClicksChart data={data.platformClicks ?? []} />
                <SourcesList
                  referrers={data.referrers ?? []}
                  countries={data.countries ?? []}
                  devices={data.devices ?? []}
                />
              </div>
            </>
          ) : (
            <Card className="border-primary/30">
              <CardContent className="py-8 text-center space-y-3">
                <Sparkles className="h-6 w-6 mx-auto text-primary" />
                <p className="font-semibold">{t('pro_required_title')}</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t('pro_required_hint')}
                </p>
                <Link href="/dashboard/settings">
                  <Button className="mt-2">{t('upgrade_cta')}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
