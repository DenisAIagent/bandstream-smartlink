export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireCrmApiKey, listSmartLinksForUser } from "@/lib/crm-platform";

/** SmartLinks d'un compte — forme `BandstreamSmartLink` du CRM. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const denied = requireCrmApiKey(request);
  if (denied) return denied;
  const { id } = await context.params;
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 100) || 100;
  return NextResponse.json({ data: await listSmartLinksForUser(id, limit) });
}
