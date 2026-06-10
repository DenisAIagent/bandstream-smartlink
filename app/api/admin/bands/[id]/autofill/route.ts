import { requireAdmin } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOdesliLinks, PLATFORM_INFO } from "@/lib/services/odesli";
import { uploadFile } from "@/lib/storage";
import { safeFetchBuffer } from "@/lib/safe-fetch";
import sharp from "sharp";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const bandId = parseInt(id);

  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid URL is required" },
        { status: 400 }
      );
    }

    // Fetch the band
    const band = await prisma.band.findUnique({
      where: { id: bandId },
      include: { platforms: { include: { platform: true } } },
    });

    if (!band) {
      return NextResponse.json({ error: "Band not found" }, { status: 404 });
    }

    // Call Odesli API
    const odesliResult = await getOdesliLinks(url);

    // Track what was updated for the response
    const created: string[] = [];
    const skipped: string[] = [];
    const platformsCreated: string[] = [];

    // Process each platform link
    for (const link of odesliResult.platformLinks) {
      // Find or create the Platform in our DB
      let platform = await prisma.platform.findUnique({
        where: { shortname: link.shortname },
      });

      if (!platform) {
        const info = PLATFORM_INFO[link.shortname];
        if (!info) continue; // Unknown platform, skip

        platform = await prisma.platform.create({
          data: {
            name: info.name,
            shortname: link.shortname,
            URL: info.url,
          },
        });
        platformsCreated.push(link.shortname);
      }

      // Check if BandPlatform already exists
      const existing = await prisma.bandPlatform.findUnique({
        where: {
          bandId_platformId: {
            bandId,
            platformId: platform.id,
          },
        },
      });

      if (existing) {
        skipped.push(link.shortname);
      } else {
        await prisma.bandPlatform.create({
          data: {
            bandId,
            platformId: platform.id,
            customURL: link.url,
          },
        });
        created.push(link.shortname);
      }
    }

    // Update metadata only if fields are empty
    const metadataUpdates: { album?: string; coverImage?: string } = {};

    if (!band.album && odesliResult.title) {
      metadataUpdates.album = odesliResult.title;
    }

    if (!band.coverImage && odesliResult.thumbnailUrl) {
      try {
        // Download the thumbnail via safe-fetch (anti-SSRF : https + hôte public)
        const imgBuffer = await safeFetchBuffer(odesliResult.thumbnailUrl);

        // Resize and convert to JPEG with sharp (limite anti pixel-bomb)
        const processedBuffer = await sharp(imgBuffer, { limitInputPixels: 24_000_000 })
          .resize(600, 600, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer();
        {

          // Upload to R2
          const key = `bands/covers/${band.domainname}.jpg`;
          const publicUrl = await uploadFile(
            key,
            processedBuffer,
            "image/jpeg"
          );
          metadataUpdates.coverImage = publicUrl;
        }
      } catch (imgError) {
        console.error("Error processing thumbnail:", imgError);
        // Non-fatal: continue without cover image
      }
    }

    // Apply metadata updates if any
    if (Object.keys(metadataUpdates).length > 0) {
      await prisma.band.update({
        where: { id: bandId },
        data: metadataUpdates,
      });
    }

    // Fetch the updated band with all platforms
    const updatedBand = await prisma.band.findUnique({
      where: { id: bandId },
      include: {
        platforms: {
          include: { platform: true },
        },
      },
    });

    return NextResponse.json({
      band: updatedBand,
      summary: {
        linksCreated: created,
        linksSkipped: skipped,
        platformsCreated,
        albumUpdated: !!metadataUpdates.album,
        coverUpdated: !!metadataUpdates.coverImage,
      },
    });
  } catch (error) {
    console.error("Autofill error:", error);
    const message =
      error instanceof Error ? error.message : "Autofill failed";

    // Odesli ne résout que les liens de titres/albums : une URL invalide ou
    // une page artiste renvoie un 4xx — erreur d'entrée, pas erreur serveur.
    if (/Odesli API error \(4\d\d\)/.test(message)) {
      return NextResponse.json(
        { error: "unresolvable_url" },
        { status: 422 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
