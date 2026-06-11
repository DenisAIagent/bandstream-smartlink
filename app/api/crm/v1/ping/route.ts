export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireCrmApiKey } from "@/lib/crm-platform";

/** Healthcheck du pont CRM → app (testé depuis la page /settings du CRM). */
export async function GET(request: Request) {
  const denied = requireCrmApiKey(request);
  if (denied) return denied;
  return NextResponse.json({ ok: true });
}
