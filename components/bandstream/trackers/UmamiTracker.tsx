'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const CONSENT_COOKIE_NAME = 'privacy:consent';
const ROOT_DOMAIN = 'band.stream';

interface UmamiTrackerProps {
  /** Umami website id provisioned for this band */
  websiteId: string;
  /** Band subdomain (without the root domain) */
  domainname: string;
}

function hasAnalyticsConsent(): boolean {
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
  if (!cookie) return false;
  try {
    return Boolean(JSON.parse(cookie.split('=')[1]).analytics);
  } catch {
    return false;
  }
}

/**
 * Loads the Umami tracking script on fan smartlink pages, only after
 * analytics consent. Listens for the `bandstream:consent` CustomEvent
 * dispatched by the ConsentManager so tracking starts without a reload.
 *
 * `data-domains` restricts collection to the band's own subdomain, so
 * /band_test/* previews on the root domain never pollute the stats.
 */
export default function UmamiTracker({ websiteId, domainname }: UmamiTrackerProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (hasAnalyticsConsent()) setEnabled(true);

    const onConsent = (event: Event) => {
      const detail = (event as CustomEvent<{ analytics?: boolean }>).detail;
      if (detail?.analytics) setEnabled(true);
    };

    window.addEventListener('bandstream:consent', onConsent);
    return () => window.removeEventListener('bandstream:consent', onConsent);
  }, []);

  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  if (!enabled || !scriptUrl || !websiteId) return null;

  return (
    <Script
      src={scriptUrl}
      data-website-id={websiteId}
      data-domains={`${domainname}.${ROOT_DOMAIN}`}
      strategy="afterInteractive"
    />
  );
}
