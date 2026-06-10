import prisma from '@/lib/prisma';

export type PlatformLinkInput = { platformId: number; customURL: string };

/**
 * customURL est rendu dans des `href` (back-office et templates).
 * Refuser tout schéma dangereux (javascript:, data:, vbscript:) : on
 * n'accepte qu'un chemin relatif ou une URL absolue http(s).
 */
export function isSafeCustomURL(value: string): boolean {
  const v = value.trim();
  if (v === '') return false;
  if (/^(javascript|data|vbscript|file):/i.test(v)) return false;
  if (/^https?:\/\//i.test(v)) return true;
  // Chemin/segment relatif : pas de schéma, pas de protocole implicite
  return !/^[a-z][a-z0-9+.-]*:/i.test(v);
}

/**
 * Upsert platform links for a band (validated against the Platform
 * catalog). Links absent from the payload are left untouched.
 * Returns the refreshed band with platforms, or null when the payload
 * contains no valid entry.
 */
export async function upsertBandPlatforms(
  bandId: number,
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
      prisma.bandPlatform.upsert({
        where: {
          bandId_platformId: {
            bandId,
            platformId: p.platformId,
          },
        },
        create: {
          bandId,
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

  return prisma.band.findUnique({
    where: { id: bandId },
    include: {
      platforms: {
        include: { platform: true },
      },
    },
  });
}
