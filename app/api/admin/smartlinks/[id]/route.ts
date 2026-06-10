export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/api-guard";
import { checkSlugAvailability } from "@/lib/services/smartlink-create";
import { isValidTemplateId } from "@/components/bandstream/landingpages/templates/shared";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const smartLinkId = parseInt(id, 10);

  const existing = await prisma.smartLink.findUnique({ where: { id: smartLinkId }, select: { bandId: true } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const bandId = existing.bandId;

  try {
    const smartLink = await prisma.smartLink.findUnique({
      where: { id: smartLinkId },
      include: {
        platforms: { include: { platform: true } },
        band: { select: { id: true, name: true, domainname: true } },
      },
    });

    if (!smartLink || smartLink.deletedAt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(smartLink);
  } catch (error) {
    console.error("Error fetching smartlink:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const smartLinkId = parseInt(id, 10);

  const existing = await prisma.smartLink.findUnique({ where: { id: smartLinkId }, select: { bandId: true } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const bandId = existing.bandId;

  try {
    const body = await req.json();
    const filtered: Record<string, unknown> = {};

    if ("title" in body) {
      const title = typeof body.title === "string" ? body.title.trim() : "";
      if (!title) {
        return NextResponse.json({ error: "invalid_title" }, { status: 400 });
      }
      filtered.title = title;
    }

    if ("slug" in body) {
      const slug =
        typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
      const current = await prisma.smartLink.findUnique({
        where: { id: smartLinkId },
        select: { slug: true },
      });
      if (slug !== current?.slug) {
        const check = await checkSlugAvailability(bandId, slug);
        if (!check.available) {
          return NextResponse.json(
            { error: check.reason ?? "taken", suggestion: check.suggestion },
            { status: check.reason === "invalid" ? 400 : 409 }
          );
        }
        filtered.slug = slug;
      }
    }

    if ("template" in body) {
      if (!isValidTemplateId(body.template as string)) {
        return NextResponse.json({ error: "Invalid template" }, { status: 400 });
      }
      filtered.template = body.template;
    }

    if (Object.keys(filtered).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.smartLink.update({
      where: { id: smartLinkId },
      data: filtered,
      include: { platforms: { include: { platform: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating smartlink:", error);
    return NextResponse.json(
      { error: "Failed to update smartlink" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const smartLinkId = parseInt(id, 10);

  const existing = await prisma.smartLink.findUnique({ where: { id: smartLinkId }, select: { bandId: true } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const bandId = existing.bandId;

  try {
    await prisma.smartLink.update({
      where: { id: smartLinkId },
      data: { deletedAt: new Date(), unpublishedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting smartlink:", error);
    return NextResponse.json(
      { error: "Failed to delete smartlink" },
      { status: 500 }
    );
  }
}
