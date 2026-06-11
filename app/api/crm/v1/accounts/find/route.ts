export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireCrmApiKey } from "@/lib/crm-platform";

/**
 * Résolution d'un compte band.stream par email — point d'entrée du CRM
 * (fiche client → onglet smartlinks). 404 si aucun compte : le CRM le
 * traite comme « pas encore inscrit », ce n'est pas une erreur.
 */
export async function GET(request: NextRequest) {
  const denied = requireCrmApiKey(request);
  if (denied) return denied;

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ data: { account_id: user.id, email: user.email } });
}
