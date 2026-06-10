export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-guard";
import { upsertSmartLinkPlatforms } from "@/lib/services/smartlink-platforms";

/**
 * Upsert des liens de plateformes d'un smartlink.
 * Body: { platforms: [{ platformId, customURL }] }
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const smartLinkId = parseInt(id, 10);


  try {
    const body = await req.json();
    const smartLink = await upsertSmartLinkPlatforms(smartLinkId, body.platforms);

    if (!smartLink) {
      return NextResponse.json(
        { error: "No valid platform links provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(smartLink);
  } catch (error) {
    console.error("Error updating smartlink platforms:", error);
    return NextResponse.json(
      { error: "Failed to update platforms" },
      { status: 500 }
    );
  }
}
