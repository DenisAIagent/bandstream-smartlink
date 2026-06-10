export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/api-guard";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const smartLinkId = parseInt(id, 10);


  try {
    await prisma.smartLink.update({
      where: { id: smartLinkId },
      data: { unpublishedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unpublishing smartlink:", error);
    return NextResponse.json(
      { error: "Failed to unpublish smartlink" },
      { status: 500 }
    );
  }
}
