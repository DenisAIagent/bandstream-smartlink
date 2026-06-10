export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-guard";
import { upsertBandPlatforms } from "@/lib/services/band-platforms";

/**
 * Upsert platform links for any band (OWNER/ADMIN only).
 * Body: { platforms: [{ platformId, customURL }] }
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const bandId = parseInt(id, 10);

  try {
    const body = await req.json();
    const band = await upsertBandPlatforms(bandId, body.platforms);

    if (!band) {
      return NextResponse.json(
        { error: "No valid platform links provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(band);
  } catch (error) {
    console.error("Error updating band platforms:", error);
    return NextResponse.json(
      { error: "Failed to update platforms" },
      { status: 500 }
    );
  }
}
