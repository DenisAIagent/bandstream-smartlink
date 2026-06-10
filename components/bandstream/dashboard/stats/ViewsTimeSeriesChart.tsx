'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface ViewsTimeSeriesChartProps {
  data: { date: string; views: number; sessions: number }[];
}

export default function ViewsTimeSeriesChart({ data }: ViewsTimeSeriesChartProps) {
  const t = useTranslations('stats');
  const locale = useLocale();

  const chartConfig = {
    views: { label: t('pageviews'), color: 'hsl(var(--chart-1))' },
    sessions: { label: t('visitors'), color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(locale, { month: 'short', day: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('time_series')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {t('no_data')}
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <AreaChart data={data} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={formatDate}
              />
              <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent labelFormatter={(value) => formatDate(String(value))} />
                }
              />
              <Area
                dataKey="views"
                type="monotone"
                fill="var(--color-views)"
                fillOpacity={0.25}
                stroke="var(--color-views)"
              />
              <Area
                dataKey="sessions"
                type="monotone"
                fill="var(--color-sessions)"
                fillOpacity={0.15}
                stroke="var(--color-sessions)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
