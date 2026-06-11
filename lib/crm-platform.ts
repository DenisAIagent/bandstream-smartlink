import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * API plateforme exposée au CRM interne (bandstream-crm).
 *
 * Le CRM consomme ces données EN DIRECT (pas de copie) via le contrat défini
 * dans son intégration `integrations/bandstream-platform.ts` :
 *   GET /v1/ping · GET /v1/accounts/find?email= ·
 *   GET /v1/accounts/:id/{artists,smartlinks}
 * Auth : `Authorization: Bearer <CRM_API_KEY>` (clé dédiée, distincte du
 * secret SSO/webhook). Réponses enveloppées `{ data: ... }`.
 */

export function requireCrmApiKey(request: Request): NextResponse | null {
  const expected = process.env.CRM_API_KEY;
  if (!expected) {
    return NextResponse.json({ error: "crm_api_not_configured" }, { status: 503 });
  }
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

function publicBandURL(domainname: string): string {
  const root = process.env.ROOT_DOMAIN ?? "band.stream";
  return `https://${domainname}.${root}`;
}

/** Forme `BandstreamArtist` attendue par le CRM. */
export async function listArtistsForUser(userId: string) {
  const memberships = await prisma.userBand.findMany({
    where: { userId, band: { deletedAt: null } },
    select: {
      band: {
        select: {
          id: true,
          name: true,
          domainname: true,
          coverImage: true,
          _count: { select: { smartLinks: { where: { deletedAt: null } } } },
        },
      },
    },
  });
  return memberships.map(({ band }) => ({
    id: String(band.id),
    name: band.name,
    slug: band.domainname,
    avatar_url: band.coverImage,
    smartlinks_count: band._count.smartLinks,
    // Clics agrégés : servis à 0 tant que l'agrégation Umami multi-sites
    // n'est pas branchée côté API (les stats détaillées restent dans l'app).
    total_clicks: 0,
  }));
}

/** Forme `BandstreamSmartLink` attendue par le CRM. */
export async function listSmartLinksForUser(userId: string, limit = 100) {
  const links = await prisma.smartLink.findMany({
    where: {
      deletedAt: null,
      band: { deletedAt: null, users: { some: { userId } } },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      publishedAt: true,
      unpublishedAt: true,
      createdAt: true,
      updatedAt: true,
      band: { select: { name: true, domainname: true } },
      platforms: {
        select: {
          customURL: true,
          platform: { select: { name: true, shortname: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 500),
  });

  return links.map((link) => ({
    id: String(link.id),
    title: link.title,
    slug: link.slug,
    url: `${publicBandURL(link.band.domainname)}/${link.slug}`,
    artist_name: link.band.name,
    cover_image_url: link.coverImage,
    platforms: link.platforms.map((entry) => ({
      key: entry.platform.shortname ?? entry.platform.name.toLowerCase(),
      label: entry.platform.name,
      url: entry.customURL,
    })),
    total_clicks: 0,
    clicks_last_7d: 0,
    clicks_last_30d: 0,
    created_at: link.createdAt.toISOString(),
    updated_at: link.updatedAt.toISOString(),
    status:
      link.publishedAt && !link.unpublishedAt ? "published" : "draft",
  }));
}
