'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';

interface ProfileSubscriptionProps {
  hasStripeCustomer: boolean;
}

interface SubscriptionInfo {
  plan: 'FREE' | 'PRO' | 'LABEL';
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export default function ProfileSubscription({ hasStripeCustomer }: ProfileSubscriptionProps) {
  const t = useTranslations('profile');
  const locale = useLocale();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch('/api/stripe/subscription')
      .then(r => (r.ok ? r.json() : null))
      .then(data => setSubscription(data))
      .catch(err => console.error('subscription fetch failed', err))
      .finally(() => setLoading(false));
  }, []);

  async function handleManageBilling() {
    setActionLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'portal failed');
      window.location.href = data.url;
    } catch (error) {
      console.error('portal failed', error);
      toast({
        title: t('payment_error_title'),
        description: t('payment_error_hint'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpgrade() {
    setActionLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'checkout failed');
      window.location.href = data.url;
    } catch (error) {
      console.error('checkout failed', error);
      toast({
        title: t('payment_error_title'),
        description: t('payment_error_hint'),
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('loading')}
      </div>
    );
  }

  const isPro =
    (subscription?.plan === 'PRO' || subscription?.plan === 'LABEL') &&
    subscription?.status === 'ACTIVE';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{t('current_plan')}:</span>
        <span
          className={`font-semibold px-2 py-1 rounded text-sm ${
            isPro ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}
        >
          {subscription?.plan ?? 'FREE'}
        </span>
      </div>

      {isPro && subscription?.currentPeriodEnd && (
        <div className="text-sm text-muted-foreground">
          {subscription.cancelAtPeriodEnd
            ? t('cancels_on', { date: new Date(subscription.currentPeriodEnd).toLocaleDateString(locale) })
            : t('renews_on', { date: new Date(subscription.currentPeriodEnd).toLocaleDateString(locale) })}
        </div>
      )}

      {isPro ? (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">{t('pro_features')}:</p>
            <ul className="space-y-1">
              {['analytics', 'tracking_pixels', 'priority_support', 'pro_badge'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  {t(`feature_${f}`)}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="outline" onClick={handleManageBilling} disabled={actionLoading || !hasStripeCustomer}>
            {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('manage_billing')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{t('upgrade_hint')}</p>
          <Button onClick={handleUpgrade} disabled={actionLoading}>
            {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('upgrade_to_pro')}
          </Button>
          <p className="text-xs text-muted-foreground">{t('upgrade_price')}</p>
        </div>
      )}
    </div>
  );
}
