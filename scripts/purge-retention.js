/**
 * Purge de rétention RGPD (art. 5.1.e — limitation de conservation).
 *
 * Applique les durées annoncées dans la politique de confidentialité :
 *  - soft-deleted (Band, SmartLink) depuis plus de 30 jours → suppression
 *    définitive (les SmartLinkPlatform suivent en cascade) ;
 *  - lignes Consent inchangées depuis plus de 13 mois (durée de validité
 *    CNIL du consentement) → suppression ;
 *  - VerificationToken expirés et Session expirées → suppression.
 *
 * Usage : `npm run purge:retention` (à brancher en cron quotidien en prod
 * — par ex. CronJob Kubernetes ou tâche planifiée Railway).
 * Idempotent et sans danger : ne touche jamais une donnée active.
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;
const SOFT_DELETE_RETENTION_DAYS = 30;
const CONSENT_RETENTION_MONTHS = 13;

async function main() {
  const now = new Date();
  const softDeleteCutoff = new Date(now.getTime() - SOFT_DELETE_RETENTION_DAYS * DAY_MS);
  const consentCutoff = new Date(now);
  consentCutoff.setMonth(consentCutoff.getMonth() - CONSENT_RETENTION_MONTHS);

  // 1. SmartLinks soft-supprimés > 30 j (plateformes en cascade).
  const smartLinks = await prisma.smartLink.deleteMany({
    where: { deletedAt: { not: null, lt: softDeleteCutoff } },
  });

  // 2. Bands soft-supprimés > 30 j : purge des dépendances restantes puis du Band.
  const staleBands = await prisma.band.findMany({
    where: { deletedAt: { not: null, lt: softDeleteCutoff } },
    select: { id: true },
  });
  const staleBandIds = staleBands.map((b) => b.id);
  let bandsDeleted = 0;
  if (staleBandIds.length > 0) {
    await prisma.$transaction([
      prisma.smartLink.deleteMany({ where: { bandId: { in: staleBandIds } } }),
      prisma.bandPlatform.deleteMany({ where: { bandId: { in: staleBandIds } } }),
      prisma.userBand.deleteMany({ where: { bandId: { in: staleBandIds } } }),
      prisma.band.deleteMany({ where: { id: { in: staleBandIds } } }),
    ]);
    bandsDeleted = staleBandIds.length;
  }

  // 3. Consentements périmés (> 13 mois sans mise à jour).
  const consents = await prisma.consent.deleteMany({
    where: { updatedAt: { lt: consentCutoff } },
  });

  // 4. Tokens et sessions expirés.
  const tokens = await prisma.verificationToken.deleteMany({
    where: { expires: { lt: now } },
  });
  const sessions = await prisma.session.deleteMany({
    where: { expires: { lt: now } },
  });

  console.log(
    `[purge-retention] smartlinks=${smartLinks.count} bands=${bandsDeleted} ` +
      `consents=${consents.count} tokens=${tokens.count} sessions=${sessions.count}`
  );
}

main()
  .catch((err) => {
    console.error("[purge-retention] failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
