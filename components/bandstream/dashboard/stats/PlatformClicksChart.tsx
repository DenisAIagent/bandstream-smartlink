'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatformIcon } from '@/components/bandstream/landingpages/PlatformIcons';

interface PlatformClicksChartProps {
  data: { platform: string; clicks: number }[];
}

/**
 * Horizontal bars with platform icons — simple divs scale better than
 * recharts for a short ranked list and keep the icons aligned.
 */
export default function PlatformClicksChart({ data }: PlatformClicksChartProps) {
  const t = useTranslations('stats');
  const sorted = [...data].sort((a, b) => b.clicks - a.clicks);
  const max = sorted[0]?.clicks ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('clicks_by_platform')}</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {t('no_data')}
          </p>
        ) : (
          <ul className="space-y-3">
            {sorted.map(({ platform, clicks }) => {
              const iconData = getPlatformIcon(platform);
              const width = max > 0 ? Math.max((clicks / max) * 100, 4) : 4;
              return (
                <li key={platform} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{
                      background: iconData.bgColor,
                      border: iconData.border ? '1px solid #2a2a2a' : undefined,
                    }}
                  >
                    {iconData.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="h-6 rounded bg-primary/20 flex items-center"
                      style={{ width: `${width}%` }}
                    >
                      <span className="px-2 text-xs font-medium whitespace-nowrap">
                        {clicks}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
