'use client';

import { useEffect, useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { useTranslations } from 'next-intl';

const CONSENT_COOKIE_NAME = 'privacy:consent';
const CONSENT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

interface ConsentChoice {
  id?: string;
  analytics: boolean;
  marketing: boolean;
}

export default function ConsentManagerSettings() {
  const [consent, setConsent] = useState<ConsentChoice>({ analytics: false, marketing: false });
  const t = useTranslations('privacy.consent');

  useEffect(() => {
    // Read current consent from cookie
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(CONSENT_COOKIE_NAME + '='));

    if (cookie) {
      try {
        setConsent(JSON.parse(decodeURIComponent(cookie.split('=')[1])));
      } catch (e) {
        console.error('Error parsing consent cookie:', e);
      }
    }
  }, []);

  const updateConsent = async (key: 'analytics' | 'marketing', value: boolean) => {
    // RGPD art. 7.3 — la révocation doit produire exactement les mêmes effets
    // que l'acceptation initiale : même privacyId (sinon la ligne Consent en
    // base est orpheline), même portée de cookie (domaine racine, partagé
    // entre sous-domaines artistes), et notification temps réel des trackers.
    const newConsent: ConsentChoice = {
      ...consent,
      id: consent.id ?? 'consent_' + Math.random().toString(36).substring(2, 15),
      [key]: value,
    };
    setConsent(newConsent);

    const rootDomain = window.location.hostname.split('.').slice(-2).join('.');
    document.cookie = `${CONSENT_COOKIE_NAME}=${JSON.stringify(newConsent)}; path=/; domain=.${rootDomain}; max-age=${CONSENT_COOKIE_MAX_AGE}`;

    // Update Google consent mode + GTM dataLayer
    window.gtag?.('consent', 'update', {
      analytics_storage: newConsent.analytics ? 'granted' : 'denied',
      ad_storage: newConsent.marketing ? 'granted' : 'denied',
    });
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        'event': 'consent_update',
        'analytics_storage': newConsent.analytics ? 'granted' : 'denied',
        'ad_storage': newConsent.marketing ? 'granted' : 'denied'
      });
    }

    // Les trackers gatés (ConsentGatedTrackers, UmamiTracker) réagissent
    // immédiatement — y compris pour CESSER de tracker en cas de retrait.
    window.dispatchEvent(new CustomEvent('bandstream:consent', { detail: newConsent }));

    // Update database
    try {
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConsent),
      });

      if (!response.ok) {
        throw new Error('Failed to update consent in database');
      }
    } catch (error) {
      console.error('Error updating consent:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">{t('analytics')}</label>
          <p className="text-xs text-muted-foreground">
            {t('analyticsDescription')}
          </p>
        </div>
        <Switch
          checked={consent.analytics}
          onCheckedChange={(checked) => updateConsent('analytics', checked)}
        />
      </div>
      
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">{t('marketing')}</label>
          <p className="text-xs text-muted-foreground">
            {t('marketingDescription')}
          </p>
        </div>
        <Switch
          checked={consent.marketing}
          onCheckedChange={(checked) => updateConsent('marketing', checked)}
        />
      </div>
    </div>
  );
}