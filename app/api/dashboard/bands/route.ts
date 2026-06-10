export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";
import { createBand } from "@/lib/services/band-create";
import { canCreateArtist } from "@/lib/services/plan-limits";
import { getLabelContext, materializeBandAccess } from "@/lib/services/label-team";

export async function GET() {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  try {
    const userId = session!.user!.id;

    const bands = await prisma.band.findMany({
      where: {
        deletedAt: null,
        users: {
          some: { userId },
        },
      },
      include: {
        platforms: {
          select: {
            platform: true,
            customURL: true,
          },
        },
        smartLinks: {
          where: { deletedAt: null },
          select: { id: true, coverImage: true, publishedAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedBands = bands.map((band) => ({
      ...band,
      platforms: band.platforms.map((p) => ({
        platformId: p.platform.id,
        platformName: p.platform.name,
        platformLogo: p.platform.logo,
        customURL: p.customURL,
      })),
      smartLinkCount: band.smartLinks.length,
      // Vignette : pochette du smartlink le plus récent, sinon celle du band
      coverImage: band.smartLinks.find((sl) => sl.coverImage)?.coverImage ?? band.coverImage,
    }));

    return NextResponse.json(transformedBands, { status: 200 });
  } catch (error) {
    console.error("Error fetching user bands:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  try {
    // Limite d'artistes par plan : FREE/PRO 1, LABEL 100
    const check = await canCreateArtist(session!.user!.id as string);
    if (!check.allowed) {
      return NextResponse.json(
        { error: "plan_limit_artists", plan: check.plan, limit: check.limit },
        { status: 403 }
      );
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name : "";
    const domainname =
      typeof body.domainname === "string" && body.domainname.length > 0
        ? body.domainname
        : undefined;

    // Les artistes d'un label appartiennent au GÉRANT (quota unique) ;
    // le créateur et les autres membres reçoivent l'accès équipe.
    const userId = session!.user!.id as string;
    const labelContext = await getLabelContext(userId);
    const ownerId = labelContext?.labelOwnerId ?? userId;

    const result = await createBand(ownerId, name, domainname);

    if (!result.ok) {
      const status = result.error === "invalid_name" ? 400 : 409;
      return NextResponse.json({ error: result.error }, { status });
    }

    if (labelContext) {
      if (ownerId !== userId) {
        await prisma.userBand.createMany({
          data: [{ userId, bandId: result.band.id, role: "ADMIN" }],
          skipDuplicates: true,
        });
      }
      await materializeBandAccess(ownerId, result.band.id, userId);
    }

    return NextResponse.json(result.band, { status: 201 });
  } catch (error) {
    console.error("Error creating band:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
