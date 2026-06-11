export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";

/**
 * Droit à l'effacement (RGPD art. 17) : suppression du compte par
 * l'utilisateur lui-même, depuis Réglages → Confidentialité.
 *
 * Effets immédiats :
 *  - les artistes dont il est OWNER sont dépubliés et soft-supprimés
 *    (pages publiques hors ligne tout de suite ; purge définitive par
 *    `npm run purge:retention` après le délai de 30 jours annoncé dans
 *    la politique de confidentialité) ;
 *  - ses accès partagés (équipe label), invitations, tickets et messages
 *    de support sont supprimés ;
 *  - la ligne User est supprimée (cascade : comptes OAuth, sessions,
 *    abonnement).
 *
 * Garde-fou : un compte interne OWNER/ADMIN ne peut pas s'auto-supprimer
 * (risque de verrouillage de la plateforme) — la demande passe par un
 * autre superadmin.
 */
export async function DELETE(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const email = session!.user?.email;
  if (!email) {
    return NextResponse.json({ error: "No email on session" }, { status: 400 });
  }

  // Confirmation explicite exigée par l'UI (anti-clic accidentel).
  const body = await req.json().catch(() => ({}));
  if (body?.confirm !== "DELETE") {
    return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      bands: { select: { bandId: true, role: true } },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.role === "OWNER" || user.role === "ADMIN") {
    return NextResponse.json({ error: "internal_account" }, { status: 403 });
  }

  const ownedBandIds = user.bands
    .filter((b) => b.role === "OWNER")
    .map((b) => b.bandId);
  const now = new Date();

  try {
    await prisma.$transaction([
      // 1. Pages publiques hors ligne immédiatement, purge définitive à 30 j.
      prisma.smartLink.updateMany({
        where: { bandId: { in: ownedBandIds } },
        data: { deletedAt: now, unpublishedAt: now },
      }),
      prisma.band.updateMany({
        where: { id: { in: ownedBandIds } },
        data: { deletedAt: now, unpublishedAt: now },
      }),
      // 2. Accès & équipe label (les deux sens : gérant et membre).
      prisma.userBand.deleteMany({
        where: { OR: [{ userId: user.id }, { bandId: { in: ownedBandIds } }] },
      }),
      prisma.labelMember.deleteMany({
        where: { OR: [{ labelOwnerId: user.id }, { userId: user.id }] },
      }),
      // 3. Support : messages de l'utilisateur + tickets entiers.
      prisma.supportMessage.deleteMany({
        where: { OR: [{ authorId: user.id }, { ticket: { userId: user.id } }] },
      }),
      prisma.supportTicket.deleteMany({ where: { userId: user.id } }),
      // 4. Invitations émises par l'utilisateur.
      prisma.userInvite.deleteMany({ where: { invitedById: user.id } }),
      // 5. User — cascade : Account, Session, Subscription, Authenticator.
      prisma.user.delete({ where: { id: user.id } }),
    ]);
  } catch (err) {
    console.error("Account deletion failed:", err);
    return NextResponse.json({ error: "deletion_failed" }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
