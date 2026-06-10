export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";
import { verifyBandOwnership } from "@/lib/auth/ownership";
import { createSmartLink } from "@/lib/services/smartlink-create";
import { canCreateSmartLink } from "@/lib/services/plan-limits";

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

  try {
    const smartLinks = await prisma.smartLink.findMany({
      where: { bandId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        template: true,
        publishedAt: true,
        unpublishedAt: true,
        createdAt: true,
        _count: { select: { platforms: true } },
      },
    });

    return NextResponse.json(
      smartLinks.map(({ _count, ...sl }) => ({
        ...sl,
        platformCount: _count.platforms,
      }))
    );
  } catch (error) {
    console.error("Error fetching smartlinks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Création d'un smartlink (brouillon).
 * Gate par plan : FREE = 1 smartlink par artiste, PRO = illimité.
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
    // Limite de smartlinks par plan : FREE 1, PRO/LABEL illimité
    const check = await canCreateSmartLink(userId, bandId);
    if (!check.allowed) {
      return NextResponse.json({ error: "plan_limit" }, { status: 403 });
    }

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title : "";
    const slug =
      typeof body.slug === "string" && body.slug.length > 0
        ? body.slug
        : undefined;

    const result = await createSmartLink(bandId, title, slug);

    if (!result.ok) {
      const status = result.error === "invalid_title" ? 400 : 409;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.smartLink, { status: 201 });
  } catch (error) {
    console.error("Error creating smartlink:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
