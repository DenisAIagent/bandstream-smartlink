export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";
import { verifyBandOwnership as verifyOwnership } from "@/lib/auth/ownership";
import { isValidTemplateId } from "@/components/bandstream/landingpages/templates/shared";
import { isValidDomainname } from "@/lib/services/band-create";
import { z } from "zod";

const socialUrl = z
  .string()
  .trim()
  .url()
  .refine((u) => u.startsWith("http://") || u.startsWith("https://"))
  .or(z.literal(""))
  .optional();

const socialsSchema = z
  .object({
    instagram: socialUrl,
    tiktok: socialUrl,
    youtube: socialUrl,
    x: socialUrl,
    facebook: socialUrl,
    website: socialUrl,
  })
  .strict();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id } = await context.params;
  const bandId = parseInt(id, 10);
  const userId = session!.user!.id as string;

  if (!(await verifyOwnership(userId, bandId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const band = await prisma.band.findUnique({
      where: { id: bandId },
      include: {
        platforms: {
          include: {
            platform: true,
          },
        },
      },
    });

    if (!band) {
      return NextResponse.json({ error: "Band not found" }, { status: 404 });
    }

    return NextResponse.json(band);
  } catch (error) {
    console.error("Error fetching band:", error);
    return NextResponse.json(
      { error: "Failed to fetch band" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id } = await context.params;
  const bandId = parseInt(id, 10);
  const userId = session!.user!.id as string;

  if (!(await verifyOwnership(userId, bandId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Whitelist allowed fields
    const allowed = [
      "name",
      "album",
      "domainname",
      "bio",
      "ticketingURL",
      "nextEventDate",
      "nextEventType",
      "nextEventLocation",
      "trackingGTAG",
      "trackingGTM",
      "trackingMeta",
      "template",
    ];
    const filtered: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) filtered[key] = body[key];
    }

    if ("template" in filtered && !isValidTemplateId(filtered.template as string)) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 });
    }

    // domainname alimente les clés de stockage S3 et le routage sous-domaine :
    // valider strictement à chaque update (anti path-traversal).
    if ("domainname" in filtered) {
      const dn = String(filtered.domainname).trim().toLowerCase();
      if (!isValidDomainname(dn)) {
        return NextResponse.json({ error: "invalid_domainname" }, { status: 400 });
      }
      filtered.domainname = dn;
    }

    // Réseaux sociaux du profil artiste : clés fixes, URLs http(s) uniquement
    if ("socials" in body) {
      const socials = socialsSchema.safeParse(body.socials);
      if (!socials.success) {
        return NextResponse.json({ error: "Invalid socials" }, { status: 400 });
      }
      filtered.socials = socials.data;
    }

    const updatedBand = await prisma.band.update({
      where: { id: bandId },
      data: filtered,
    });

    return NextResponse.json(updatedBand);
  } catch (error) {
    console.error("Error updating band:", error);
    return NextResponse.json(
      { error: "Failed to update band" },
      { status: 500 }
    );
  }
}
