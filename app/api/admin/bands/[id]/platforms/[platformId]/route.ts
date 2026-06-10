export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/api-guard";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; platformId: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id, platformId } = await context.params;
  const bandId = parseInt(id, 10);
  const platId = parseInt(platformId, 10);

  try {
    await prisma.bandPlatform.delete({
      where: {
        bandId_platformId: {
          bandId,
          platformId: platId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting platform link:", error);
    return NextResponse.json(
      { error: "Failed to delete platform link" },
      { status: 500 }
    );
  }
}
