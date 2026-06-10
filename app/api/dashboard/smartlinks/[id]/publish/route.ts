export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";
import { verifySmartLinkOwnership } from "@/lib/auth/ownership";
import { ensureBandWebsite } from "@/lib/services/umami";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || "band.stream";

/**
 * Publie un smartlink. Publie aussi le band parent si nécessaire
 * (le sous-domaine doit résoudre) et provisionne Umami (best effort).
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id } = await context.params;
  const smartLinkId = parseInt(id, 10);
  const userId = session!.user!.id as string;

  const bandId = await verifySmartLinkOwnership(userId, smartLinkId);
  if (bandId === null) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const smartLink = await prisma.smartLink.update({
      where: { id: smartLinkId },
      data: { publishedAt: new Date(), unpublishedAt: null },
      select: { slug: true },
    });

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
      await prisma.band.update({
        where: { id: bandId },
        data: { publishedAt: new Date(), unpublishedAt: null },
      });
    }

    await ensureBandWebsite(band);

    return NextResponse.json({
      url: `https://${band.domainname}.${ROOT_DOMAIN}/${smartLink.slug}`,
    });
  } catch (error) {
    console.error("Error publishing smartlink:", error);
    return NextResponse.json(
      { error: "Failed to publish smartlink" },
      { status: 500 }
    );
  }
}
