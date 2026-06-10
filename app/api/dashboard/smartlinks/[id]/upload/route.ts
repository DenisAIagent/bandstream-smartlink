export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-guard";
import { verifySmartLinkOwnership } from "@/lib/auth/ownership";
import { processSmartLinkUpload } from "@/lib/services/smartlink-upload";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id } = await context.params;
  const smartLinkId = parseInt(id, 10);
  const userId = session!.user!.id as string;

  if ((await verifySmartLinkOwnership(userId, smartLinkId)) === null) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const result = await processSmartLinkUpload(smartLinkId, formData);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.smartLink);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
