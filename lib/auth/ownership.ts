import prisma from "@/lib/prisma";

/**
 * True when the user is a member of the band (any UserBand role).
 * Used by /api/dashboard routes to scope access to the caller's bands.
 */
export async function verifyBandOwnership(
  userId: string,
  bandId: number
): Promise<boolean> {
  if (!Number.isInteger(bandId)) return false;

  const userBand = await prisma.userBand.findUnique({
    where: {
      userId_bandId: {
        userId,
        bandId,
      },
    },
  });
  return !!userBand;
}

/**
 * Ownership d'un smartlink = membership du band parent.
 * Retourne le bandId quand l'accès est autorisé, null sinon.
 */
export async function verifySmartLinkOwnership(
  userId: string,
  smartLinkId: number
): Promise<number | null> {
  if (!Number.isInteger(smartLinkId)) return null;

  const smartLink = await prisma.smartLink.findUnique({
    where: { id: smartLinkId },
    select: { bandId: true },
  });
  if (!smartLink) return null;

  const allowed = await verifyBandOwnership(userId, smartLink.bandId);
  return allowed ? smartLink.bandId : null;
}
