export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-guard";
import { checkDomainAvailability } from "@/lib/services/band-create";

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const domainname = req.nextUrl.searchParams
    .get("domainname")
    ?.trim()
    .toLowerCase();

  if (!domainname) {
    return NextResponse.json(
      { error: "domainname is required" },
      { status: 400 }
    );
  }

  try {
    const result = await checkDomainAvailability(domainname);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking domain availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
