/**
 * Backfill : crée 1 SmartLink par Band existant (sa "première sortie").
 *
 *   node scripts/migrate-smartlinks.js
 *
 * Idempotent : les bands ayant déjà au moins un SmartLink sont ignorés.
 * Ne supprime ni ne modifie rien côté Band/BandPlatform (sécurité rollback).
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Doit rester aligné avec lib/middleware-utils/reserved-slugs.ts
const RESERVED_SLUGS = [
  'en','fr','de','es','it','pt','ja','zh','ar','hi','bn','ru','tr','ko',
  'vi','id','th','fa','pl','nl','ur','ms','uk','ro','el','is',
  'demo','demo2','demo3','demo4','demo5',
  'api','dashboard','admin','login','legal','privacy','terms','pdb',
  'newsletter','band_test','404','customer',
];

function slugifyTitle(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

async function uniqueSlugForBand(bandId, base) {
  let candidate = base;
  for (let i = 2; i <= 100; i++) {
    const existing = await prisma.smartLink.findUnique({
      where: { bandId_slug: { bandId, slug: candidate } },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${i}`.slice(0, 63);
  }
  throw new Error(`No free slug for band ${bandId} from base "${base}"`);
}

async function main() {
  const bands = await prisma.band.findMany({
    where: { deletedAt: null },
    include: {
      platforms: true,
      smartLinks: { select: { id: true } },
    },
  });

  let created = 0;
  let skipped = 0;

  for (const band of bands) {
    if (band.smartLinks.length > 0) {
      skipped++;
      continue;
    }

    let base = slugifyTitle(band.album) || 'latest';
    if (RESERVED_SLUGS.includes(base)) base = `${base}-1`;
    const slug = await uniqueSlugForBand(band.id, base);

    await prisma.smartLink.create({
      data: {
        bandId: band.id,
        title: band.album || band.name,
        slug,
        coverImage: band.coverImage,
        musicSample: band.musicSample,
        template: band.template,
        publishedAt: band.publishedAt,
        unpublishedAt: band.unpublishedAt,
        platforms: {
          create: band.platforms.map((bp) => ({
            platformId: bp.platformId,
            customURL: bp.customURL,
          })),
        },
      },
    });

    created++;
    console.log(
      `✓ ${band.name} (${band.domainname}) → smartlink "/${slug}" (${band.platforms.length} plateformes)`
    );
  }

  console.log(`\nTerminé : ${created} smartlink(s) créé(s), ${skipped} band(s) déjà migré(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
