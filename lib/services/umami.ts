import { getClient, UmamiApiClient } from '@umami/api-client';
import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

/**
 * Umami analytics integration.
 *
 * One Umami website per Band: the v0.76 API client cannot filter
 * stats/pageviews by host, and every smartlink page renders at "/"
 * on its own subdomain, so a shared website cannot be segmented.
 *
 * Env (see @umami/api-client getClient()):
 *   UMAMI_API_CLIENT_ENDPOINT  e.g. https://umami.example.com/api
 *   UMAMI_API_CLIENT_USER_ID + UMAMI_API_CLIENT_SECRET (self-hosted)
 *   or UMAMI_API_KEY (Umami Cloud)
 *   NEXT_PUBLIC_UMAMI_SCRIPT_URL e.g. https://umami.example.com/script.js
 */

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'band.stream';

let client: UmamiApiClient | null = null;

export function isUmamiConfigured(): boolean {
  return Boolean(
    process.env.UMAMI_API_KEY ||
      (process.env.UMAMI_API_CLIENT_ENDPOINT &&
        process.env.UMAMI_API_CLIENT_USER_ID &&
        process.env.UMAMI_API_CLIENT_SECRET)
  );
}

function getUmami(): UmamiApiClient {
  if (!client) {
    client = getClient();
  }
  return client;
}

/**
 * Lazily create the Umami website for a band and persist its id.
 * Safe to call repeatedly; no-op when already provisioned or when
 * Umami is not configured (returns null in that case).
 */
export async function ensureBandWebsite(band: {
  id: number;
  name: string;
  domainname: string;
  umamiWebsiteId: string | null;
}): Promise<string | null> {
  if (band.umamiWebsiteId) return band.umamiWebsiteId;
  if (!isUmamiConfigured()) return null;

  try {
    const { ok, data } = await getUmami().createWebsite({
      name: band.name,
      domain: `${band.domainname}.${ROOT_DOMAIN}`,
    });

    if (!ok || !data?.id) {
      console.error('Umami createWebsite failed for band', band.id);
      return null;
    }

    await prisma.band.update({
      where: { id: band.id },
      data: { umamiWebsiteId: data.id },
    });

    return data.id;
  } catch (error) {
    console.error('Umami createWebsite error:', error);
    return null;
  }
}

export type StatsRange = '7d' | '30d' | '90d';

const RANGE_DAYS: Record<StatsRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export interface BandStats {
  summary: {
    pageviews: number;
    visitors: number;
    visits: number;
    totalClicks: number;
  };
  timeseries: { date: string; views: number; sessions: number }[];
  platformClicks: { platform: string; clicks: number }[];
  referrers: { name: string; count: number }[];
  countries: { name: string; count: number }[];
  devices: { name: string; count: number }[];
}

type MetricRow = { x: string | null; y: number };

function rangeBounds(range: StatsRange): { startAt: number; endAt: number } {
  const endAt = Date.now();
  const startAt = endAt - RANGE_DAYS[range] * 24 * 60 * 60 * 1000;
  return { startAt, endAt };
}

async function fetchBandStats(
  websiteId: string,
  range: StatsRange,
  timezone: string,
  url?: string
): Promise<BandStats> {
  const umami = getUmami();
  const { startAt, endAt } = rangeBounds(range);
  const base = url ? { startAt, endAt, url } : { startAt, endAt };

  const [stats, pageviews, events, referrers, countries, devices] =
    await Promise.all([
      umami.getWebsiteStats(websiteId, base),
      umami.getWebsitePageviews(websiteId, {
        ...base,
        unit: 'day',
        timezone,
      }),
      umami.getWebsiteMetrics(websiteId, { ...base, type: 'event' }),
      umami.getWebsiteMetrics(websiteId, { ...base, type: 'referrer' }),
      umami.getWebsiteMetrics(websiteId, { ...base, type: 'country' }),
      umami.getWebsiteMetrics(websiteId, { ...base, type: 'device' }),
    ]);

  const statsData = (stats.data ?? {}) as Record<
    string,
    { value: number } | number | undefined
  >;
  const num = (key: string): number => {
    const v = statsData[key];
    if (typeof v === 'number') return v;
    return v?.value ?? 0;
  };

  const eventRows = ((events.data ?? []) as MetricRow[]).filter((row) =>
    (row.x ?? '').startsWith('listen_')
  );

  const pv = (pageviews.data ?? {}) as {
    pageviews?: { x: string; y: number }[];
    sessions?: { x: string; y: number }[];
  };
  const sessionsByDate = new Map(
    (pv.sessions ?? []).map((row) => [row.x, row.y])
  );

  const toRows = (rows: unknown): { name: string; count: number }[] =>
    ((rows ?? []) as MetricRow[]).map((row) => ({
      name: row.x ?? 'unknown',
      count: row.y,
    }));

  return {
    summary: {
      pageviews: num('pageviews'),
      visitors: num('visitors'),
      visits: num('visits'),
      totalClicks: eventRows.reduce((sum, row) => sum + row.y, 0),
    },
    timeseries: (pv.pageviews ?? []).map((row) => ({
      date: row.x,
      views: row.y,
      sessions: sessionsByDate.get(row.x) ?? 0,
    })),
    platformClicks: eventRows.map((row) => ({
      platform: (row.x ?? '').replace(/^listen_/, ''),
      clicks: row.y,
    })),
    referrers: toRows(referrers.data),
    countries: toRows(countries.data),
    devices: toRows(devices.data),
  };
}

/**
 * Cached band stats (5 min). Cache key includes website, range, tz and
 * the optional url filter (stats par smartlink : url = '/{slug}').
 */
export async function getBandStats(
  websiteId: string,
  range: StatsRange,
  timezone: string = 'Europe/Paris',
  url?: string
): Promise<BandStats> {
  const cached = unstable_cache(
    () => fetchBandStats(websiteId, range, timezone, url),
    ['band-stats', websiteId, range, timezone, url ?? 'all'],
    { revalidate: 300 }
  );
  return cached();
}
