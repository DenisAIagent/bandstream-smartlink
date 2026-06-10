export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-guard";
import { processSmartLinkUpload } from "@/lib/services/smartlink-upload";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const smartLinkId = parseInt(id, 10);


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
