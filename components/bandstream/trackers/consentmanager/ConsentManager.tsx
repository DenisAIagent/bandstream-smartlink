'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';

// Update window interface
declare global {
  type GtagArgs = {
    analytics_storage?: 'granted' | 'denied';
    ad_storage?: 'granted' | 'denied';
    [key: string]: unknown;
  };

  interface Window {
    dataLayer: {
      push(item: DataLayerItem): number;
    };
    gtag: (
      command: 'consent' | 'config' | 'event' | 'set',
      action: string,
      config?: GtagArgs
    ) => void;
  }
}

const CONSENT_COOKIE_NAME = 'privacy:consent';
const CONSENT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

interface ConsentChoice {
  id: string;
  analytics: boolean;
  marketing: boolean;
}

const generateUniqueId = () => {
  const uuid = globalThis.crypto?.randomUUID?.();
  return 'consent_' + (uuid ?? Math.random().toString(36).substring(2, 15));
};

interface GtagConsentEvent {
  event: string;
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  consent_id?: string;
}

type DataLayerItem = GtagConsentEvent | [string, string, GtagArgs?];

export default function ConsentManager() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('privacy.consent');

  useEffect(() => {
    // Initialize Google's consent mode with default values
    window.gtag = window.gtag || function(
      command: 'consent' | 'config' | 'event' | 'set',
      action: string,
      config?: GtagArgs
    ) { 
      (window.dataLayer = window.dataLayer || []).push([command, action, config]);
    };
    
    // Check if consent cookie exists and parse it
    const consentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(CONSENT_COOKIE_NAME + '='));
    
    if (consentCookie) {
      try {
        const consentValue = JSON.parse(consentCookie.split('=')[1]) as ConsentChoice;
        // Update gtag consent settings based on stored preferences
        window.gtag('consent', 'update', {
          'analytics_storage': consentValue.analytics ? 'granted' : 'denied',
          'ad_storage': consentValue.marketing ? 'granted' : 'denied'
        });
      } catch (error) {
        console.error('Error parsing consent cookie:', error);
      }
    } else {
      // No consent yet, set default values
      window.gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
      });
      setOpen(true);
    }
  }, []);

  const setConsentCookie = async (choice: Omit<ConsentChoice, 'id'>) => {
    const consentWithId = {
      ...choice,
      id: generateUniqueId()
    };
    
    const rootDomain = window.location.hostname.split('.').slice(-2).join('.');
    document.cookie = `${CONSENT_COOKIE_NAME}=${JSON.stringify(consentWithId)}; path=/; domain=.${rootDomain}; max-age=${CONSENT_COOKIE_MAX_AGE}`;
    
    // Update gtag consent settings
    window.gtag?.('consent', 'update', {
      'analytics_storage': choice.analytics ? 'granted' : 'denied',
      'ad_storage': choice.marketing ? 'granted' : 'denied'
    });

    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'consent_update',
        analytics_storage: choice.analytics ? 'granted' : 'denied',
        ad_storage: choice.marketing ? 'granted' : 'denied'
      });
    }

    // Notify in-page listeners (e.g. UmamiTracker) without a reload
    window.dispatchEvent(
      new CustomEvent('bandstream:consent', { detail: consentWithId })
    );

    // Updated API call to include the id
    try {
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consentWithId), // Now sending the complete object with id
      });

      if (!response.ok) {
        throw new Error('Failed to update consent in database');
      }
    } catch (error) {
      console.error('Error updating consent:', error);
    }
  };

  const handleAcceptAll = async () => {
    await setConsentCookie({ analytics: true, marketing: true });
    setOpen(false);
  };

  const handleAcceptNecessary = async () => {
    await setConsentCookie({ analytics: false, marketing: false });
    setOpen(false);
  };

  if (!open) return null;

  // Non-blocking bottom banner: fans can reach the listen buttons even
  // before making a consent choice (no tracking happens until accepted).
  return (
    <div
      role="region"
      aria-label={t('notice')}
      className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-4"
    >
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 shadow-lg p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-primary/10 p-1.5 rounded-lg shrink-0">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.96-7 10.12-3.87-1.16-7-5.45-7-10.12V6.3l7-3.12z"/>
            </svg>
          </div>
          <h2 className="text-sm font-semibold">{t('notice')}</h2>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {t('description')} {t('canupdate')}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleAcceptNecessary}
          >
            {t('reject')}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={handleAcceptAll}
          >
            {t('accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}