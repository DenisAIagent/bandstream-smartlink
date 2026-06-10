import prisma from '@/lib/prisma';

const publishedBandWhere = (domainname: string) => ({
  domainname,
  publishedAt: { not: null },
  unpublishedAt: null,
  deletedAt: null,
});

const publishedSmartLinkWhere = {
  publishedAt: { not: null },
  unpublishedAt: null,
  deletedAt: null,
} as const;

const platformSelect = {
  platform: {
    select: {
      id: true,
      name: true,
      logo: true,
      URL: true,
      shortname: true,
    },
  },
  customURL: true,
} as const;

/**
 * Données de la page artiste (hub) : profil + liste des sorties publiées.
 * Inclut aussi les champs legacy (album/platforms) pour le fallback de
 * rendu pré-backfill.
 */
export async function getArtistHubData(domainname: string) {
  return prisma.band.findFirst({
    where: publishedBandWhere(domainname),
    select: {
      id: true,
      name: true,
      bio: true,
      socials: true,
      domainname: true,
      coverImage: true,
      trackingGTM: true,
      trackingGTAG: true,
      trackingMeta: true,
      umamiWebsiteId: true,
      // Legacy (fallback pré-backfill)
      album: true,
      musicSample: true,
      template: true,
      platforms: { select: platformSelect },
      smartLinks: {
        where: publishedSmartLinkWhere,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          musicSample: true,
          template: true,
          publishedAt: true,
          platforms: { select: platformSelect },
        },
      },
    },
  });
}

/**
 * Un smartlink publié précis ({artist}.band.stream/{slug}).
 */
export async function getSmartLinkData(domainname: string, slug: string) {
  const band = await prisma.band.findFirst({
    where: publishedBandWhere(domainname),
    select: {
      id: true,
      name: true,
      domainname: true,
      smartLinks: {
        where: { slug, ...publishedSmartLinkWhere },
        take: 1,
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          musicSample: true,
          template: true,
          platforms: { select: platformSelect },
        },
      },
    },
  });

  if (!band || band.smartLinks.length === 0) return null;

  const { smartLinks, ...artist } = band;
  return { band: artist, smartLink: smartLinks[0] };
}

export type ArtistHubData = NonNullable<Awaited<ReturnType<typeof getArtistHubData>>>;
export type SmartLinkData = NonNullable<Awaited<ReturnType<typeof getSmartLinkData>>>;
