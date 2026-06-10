export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/api-guard";
import { createSmartLink } from "@/lib/services/smartlink-create";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const bandId = parseInt(id, 10);

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

/** Création admin : pas de gate de plan (équipe band.stream). */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const bandId = parseInt(id, 10);

  try {
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
