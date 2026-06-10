export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-guard";
import { verifyBandOwnership } from "@/lib/auth/ownership";
import { upsertBandPlatforms } from "@/lib/services/band-platforms";

/**
 * Upsert platform links for a band.
 * Body: { platforms: [{ platformId, customURL }] }
 * Existing links not present in the payload are left untouched
 * (removal goes through DELETE .../platforms/[platformId]).
 */
export async function PUT(
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
