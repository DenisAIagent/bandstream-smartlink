import prisma from '@/lib/prisma';
import { isSafeCustomURL, type PlatformLinkInput } from '@/lib/services/band-platforms';

/**
 * Upsert des liens de plateformes d'un smartlink (même contrat que
 * upsertBandPlatforms, contre SmartLinkPlatform). Les liens absents du
 * payload ne sont pas touchés — la suppression passe par DELETE.
 */
export async function upsertSmartLinkPlatforms(
  smartLinkId: number,
  platforms: PlatformLinkInput[]
) {
  const valid = (Array.isArray(platforms) ? platforms : []).filter(
    (p) =>
      Number.isInteger(p.platformId) &&
      typeof p.customURL === 'string' &&
      isSafeCustomURL(p.customURL)
  );

  if (valid.length === 0) return null;

  const known = await prisma.platform.findMany({
    where: {
      id: { in: valid.map((p) => p.platformId) },
      deletedAt: null,
    },
    select: { id: true },
  });
  const knownIds = new Set(known.map((p) => p.id));

  const upserts = valid
    .filter((p) => knownIds.has(p.platformId))
    .map((p) =>
      prisma.smartLinkPlatform.upsert({
        where: {
          smartLinkId_platformId: {
            smartLinkId,
            platformId: p.platformId,
          },
        },
        create: {
          smartLinkId,
          platformId: p.platformId,
          customURL: p.customURL.trim(),
        },
        update: {
          customURL: p.customURL.trim(),
        },
      })
    );

  if (upserts.length === 0) return null;

  await prisma.$transaction(upserts);

  return prisma.smartLink.findUnique({
    where: { id: smartLinkId },
    include: {
      platforms: {
        include: { platform: true },
      },
    },
  });
}
