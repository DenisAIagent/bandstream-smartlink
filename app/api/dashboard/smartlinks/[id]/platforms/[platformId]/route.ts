export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";
import { verifySmartLinkOwnership } from "@/lib/auth/ownership";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; platformId: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id, platformId } = await context.params;
  const smartLinkId = parseInt(id, 10);
  const platformIdInt = parseInt(platformId, 10);
  const userId = session!.user!.id as string;

  if ((await verifySmartLinkOwnership(userId, smartLinkId)) === null) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.smartLinkPlatform.delete({
      where: {
        smartLinkId_platformId: {
          smartLinkId,
          platformId: platformIdInt,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting smartlink platform:", error);
    return NextResponse.json(
      { error: "Failed to delete platform" },
      { status: 500 }
    );
  }
}
