export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";
import { verifyBandOwnership } from "@/lib/auth/ownership";
import { getBandOwnerPlan } from "@/lib/services/plan-limits";
import {
  ensureBandWebsite,
  getBandStats,
  isUmamiConfigured,
  type StatsRange,
} from "@/lib/services/umami";

const VALID_RANGES: StatsRange[] = ["7d", "30d", "90d"];

/**
 * Band analytics, fetched server-side from Umami.
 * FREE plan: summary only (pageviews, visitors, total clicks).
 * PRO plan: full payload (timeseries, platform clicks, sources).
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id } = await context.params;
  const bandId = parseInt(id, 10);
  const userId = session!.user!.id as string;

  if (!(await verifyBandOwnership(userId, bandId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rangeParam = req.nextUrl.searchParams.get("range") ?? "7d";
  const range: StatsRange = VALID_RANGES.includes(rangeParam as StatsRange)
    ? (rangeParam as StatsRange)
    : "7d";
  const timezone = req.nextUrl.searchParams.get("tz") ?? "Europe/Paris";
  // Stats par smartlink : filtre Umami sur le path '/{slug}'
  const slugParam = req.nextUrl.searchParams.get("slug")?.trim() || null;
  const urlFilter =
    slugParam && /^[a-z0-9](-?[a-z0-9]){1,62}$/.test(slugParam)
      ? `/${slugParam}`
      : undefined;

  try {
    const band = await prisma.band.findUnique({
      where: { id: bandId },
      select: {
        id: true,
        name: true,
        domainname: true,
        publishedAt: true,
        umamiWebsiteId: true,
      },
    });

    if (!band) {
      return NextResponse.json({ error: "Band not found" }, { status: 404 });
    }

    if (!band.publishedAt) {
      return NextResponse.json({ pending: true, reason: "unpublished" });
    }

    if (!isUmamiConfigured()) {
      return NextResponse.json({ pending: true, reason: "not_configured" });
    }

    const websiteId = band.umamiWebsiteId ?? (await ensureBandWebsite(band));
    if (!websiteId) {
      return NextResponse.json({ pending: true, reason: "not_configured" });
    }

    const [plan, stats] = await Promise.all([
      // Les stats détaillées suivent le plan du PROPRIÉTAIRE de l'artiste
      // (un membre d'équipe Free voit les stats Pro/Label du compte)
      getBandOwnerPlan(bandId, userId),
      getBandStats(websiteId, range, timezone, urlFilter),
    ]);

    if (plan === "FREE") {
      return NextResponse.json({
        plan,
        range,
        summary: stats.summary,
      });
    }

    return NextResponse.json({ plan, range, ...stats });
  } catch (error) {
    console.error("Error fetching band stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
