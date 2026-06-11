export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireCrmApiKey, listArtistsForUser } from "@/lib/crm-platform";

/** Artistes d'un compte — forme `BandstreamArtist` du CRM. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const denied = requireCrmApiKey(request);
  if (denied) return denied;
  const { id } = await context.params;
  return NextResponse.json({ data: await listArtistsForUser(id) });
}
