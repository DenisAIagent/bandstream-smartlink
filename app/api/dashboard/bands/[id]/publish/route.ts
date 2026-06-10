export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";
import { verifyBandOwnership } from "@/lib/auth/ownership";
import { ensureBandWebsite } from "@/lib/services/umami";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || "band.stream";

/**
 * Publish a band page (makes {domainname}.{ROOT_DOMAIN} live) and
 * provision its Umami analytics website when configured.
 */
export async function POST(
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

  try {
    const band = await prisma.band.update({
      where: { id: bandId },
      data: {
        publishedAt: new Date(),
        unpublishedAt: null,
      },
      select: {
        id: true,
        name: true,
        domainname: true,
        umamiWebsiteId: true,
      },
    });

    // Best-effort analytics provisioning — publishing never fails on it
    await ensureBandWebsite(band);

    return NextResponse.json({
      url: `https://${band.domainname}.${ROOT_DOMAIN}`,
    });
  } catch (error) {
    console.error("Error publishing band:", error);
    return NextResponse.json(
      { error: "Failed to publish band" },
      { status: 500 }
    );
  }
}
