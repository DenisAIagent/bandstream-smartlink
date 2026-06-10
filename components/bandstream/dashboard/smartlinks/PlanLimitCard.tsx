'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Upsell affiché quand la limite FREE (1 smartlink par artiste) est
 * atteinte — même pattern que la carte Pro des stats.
 */
export default function PlanLimitCard() {
  const t = useTranslations('smartlinks');

  return (
    <Card className="border-primary/30">
      <CardContent className="py-8 text-center space-y-3">
        <Sparkles className="h-6 w-6 mx-auto text-primary" />
        <p className="font-semibold">{t('plan_limit_title')}</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {t('plan_limit_body')}
        </p>
        <Link href="/dashboard/settings">
          <Button className="mt-2">{t('upgrade_cta')}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
