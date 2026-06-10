'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Row = { name: string; count: number };

interface SourcesListProps {
  referrers: Row[];
  countries: Row[];
  devices: Row[];
}

function RankedList({ rows, emptyLabel }: { rows: Row[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">{emptyLabel}</p>
    );
  }
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <ul className="space-y-2">
      {rows.slice(0, 8).map((row) => (
        <li key={row.name} className="relative flex items-center justify-between gap-2 px-2 py-1.5 rounded overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-primary/10 rounded"
            style={{ width: `${(row.count / max) * 100}%` }}
          />
          <span className="relative text-sm truncate">{row.name || '—'}</span>
          <span className="relative text-sm font-medium tabular-nums">{row.count}</span>
        </li>
      ))}
    </ul>
  );
}

export default function SourcesList({ referrers, countries, devices }: SourcesListProps) {
  const t = useTranslations('stats');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('sources')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="referrers">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="referrers">{t('referrers')}</TabsTrigger>
            <TabsTrigger value="countries">{t('countries')}</TabsTrigger>
            <TabsTrigger value="devices">{t('devices')}</TabsTrigger>
          </TabsList>
          <TabsContent value="referrers">
            <RankedList rows={referrers} emptyLabel={t('no_data')} />
          </TabsContent>
          <TabsContent value="countries">
            <RankedList rows={countries} emptyLabel={t('no_data')} />
          </TabsContent>
          <TabsContent value="devices">
            <RankedList rows={devices} emptyLabel={t('no_data')} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
