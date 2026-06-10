export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";

async function verifyOwnership(userId: string, bandId: number) {
  const userBand = await prisma.userBand.findUnique({
    where: {
      userId_bandId: {
        userId,
        bandId,
      },
    },
  });
  return !!userBand;
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; platformId: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id, platformId } = await context.params;
  const bandId = parseInt(id, 10);
  const platId = parseInt(platformId, 10);
  const userId = session!.user!.id as string;

  if (!(await verifyOwnership(userId, bandId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
