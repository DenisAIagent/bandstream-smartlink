export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";
import { verifySSOTokenWith } from "@/lib/shop-sso";

/**
 * Atterrissage du raccourci support « Accéder au compte band.stream »
 * depuis une fiche client du CRM interne.
 *
 * Le CRM signe un jeton court (60 s, secret partagé CRM_SSO_SECRET) avec
 * l'email de l'agent et l'identifiant du compte client : on ouvre une
 * session via le provider `crm-sso` (qui re-vérifie le jeton et exige un
 * compte interne OWNER/ADMIN), puis on redirige droit sur la fiche
 * client 360° (/admin/users/:id).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const secret = process.env.CRM_SSO_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "crm_sso_not_configured" }, { status: 503 });
  }

  // Pré-lecture (non fiduciaire — authorize() re-vérifie) pour construire la
  // cible de redirection. account_id validé en format cuid pour éviter tout
  // open redirect.
  const payload = verifySSOTokenWith<{
    type?: string;
    account_id?: string;
    exp: number;
  }>(secret, token);
  if (!payload || payload.type !== "crm_admin_access") {
    return NextResponse.redirect(new URL("/login?error=crm_sso", request.nextUrl.origin));
  }

  const accountId =
    payload.account_id && /^[a-zA-Z0-9_-]{1,64}$/.test(payload.account_id)
      ? payload.account_id
      : null;
  const target = accountId ? `/admin/users/${accountId}` : "/admin";

  try {
    await signIn("crm-sso", { token, redirectTo: target });
  } catch (err) {
    // signIn lance une NEXT_REDIRECT en cas de succès — la propager.
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("CRM SSO sign-in failed:", err);
    return NextResponse.redirect(new URL("/login?error=crm_sso", request.nextUrl.origin));
  }
  return NextResponse.redirect(new URL(target, request.nextUrl.origin));
}
