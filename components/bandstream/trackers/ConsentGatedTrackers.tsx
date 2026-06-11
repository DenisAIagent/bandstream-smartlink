'use client';

import { useEffect, useState } from 'react';
import GoogleAnalyticsHead from '@/components/bandstream/trackers/head/GoogleAnalyticsHead';
import GoogleTagManagerHead from '@/components/bandstream/trackers/head/GoogleTagManagerHead';

const CONSENT_COOKIE_NAME = 'privacy:consent';

interface ConsentChoice {
  analytics?: boolean;
  marketing?: boolean;
}

function readConsent(): ConsentChoice | null {
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(CONSENT_COOKIE_NAME + '='));
  if (!cookie) return null;
  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1])) as ConsentChoice;
  } catch {
    return null;
  }
}

interface ConsentGatedTrackersProps {
  corporateGtmId?: string | null;
  artistGtagId?: string | null;
  artistGtmId?: string | null;
}

/**
 * RGPD (art. 7, lignes directrices CEPD) : AUCUN script tiers ne doit être
 * chargé avant le consentement — le simple chargement de gtag.js/gtm.js
 * transmet l'IP du visiteur à Google. Ce composant ne rend les trackers
 * Google (corporate + artiste) qu'une fois le consentement « analytics »
 * donné, et réagit en direct à l'événement `bandstream:consent` émis par
 * le ConsentManager (accept) comme par le panneau de réglages (révocation).
 * Umami (self-hosted, sans cookie) est gaté séparément dans UmamiTracker.
 */
export default function ConsentGatedTrackers({
  corporateGtmId,
  artistGtagId,
  artistGtmId,
}: ConsentGatedTrackersProps) {
  const [analyticsGranted, setAnalyticsGranted] = useState(false);

  useEffect(() => {
    setAnalyticsGranted(readConsent()?.analytics === true);

    const onConsent = (event: Event) => {
      const detail = (event as CustomEvent<ConsentChoice>).detail;
      setAnalyticsGranted(detail?.analytics === true);
    };
    window.addEventListener('bandstream:consent', onConsent);
    return () => window.removeEventListener('bandstream:consent', onConsent);
  }, []);

  // Refus ou pas encore de choix → zéro requête vers Google.
  if (!analyticsGranted) return null;

  return (
    <>
      {corporateGtmId && <GoogleTagManagerHead GTM_ID={corporateGtmId} />}
      {artistGtagId && <GoogleAnalyticsHead GA_MEASUREMENT_ID={artistGtagId} />}
      {artistGtmId && <GoogleTagManagerHead GTM_ID={artistGtmId} />}
    </>
  );
}
