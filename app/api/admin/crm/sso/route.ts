export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-guard";
import { signSSOTokenWith, SSO_AUD } from "@/lib/shop-sso";

/**
 * Pont SSO app → CRM interne (Logiciels internes/bandstream-crm).
 * Réservé à l'équipe band.stream (OWNER/ADMIN) : le CRM gère le commercial
 * et le service client, ce n'est pas une surface client. Le CRM ne connecte
 * que les agents déjà créés par un admin CRM (pas d'auto-provisioning) —
 * son RBAC interne (rôles, compétences) reste souverain.
 * S'ouvre dans un nouvel onglet depuis la sidebar admin, sans relogin.
 */
export async function GET() {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const email = session!.user?.email;
  if (!email) {
    return NextResponse.json({ error: "No email on session" }, { status: 400 });
  }

  const crmURL = process.env.CRM_PUBLIC_URL;
  const secret = process.env.CRM_SSO_SECRET;
  if (!crmURL || !secret) {
    console.error("CRM SSO misconfigured: CRM_PUBLIC_URL / CRM_SSO_SECRET missing");
    return NextResponse.json({ error: "crm_not_configured" }, { status: 503 });
  }

  const token = signSSOTokenWith(secret, {
    email,
    name: session!.user?.name ?? email.split("@")[0],
  }, SSO_AUD.crm);

  const target = new URL("/api/v1/auth/sso/bandstream", crmURL);
  target.searchParams.set("token", token);
  return NextResponse.redirect(target.toString(), 302);
}
