import { signSSOTokenWith, SSO_AUD } from "@/lib/shop-sso";

/**
 * Notifications sortantes vers le CRM interne (bandstream-crm).
 *
 * À chaque événement client (inscription, changement de plan, add-on), on
 * pousse un événement signé vers le webhook du CRM qui crée/met à jour la
 * fiche client et sa timeline. Fire-and-forget strict : un CRM indisponible
 * ne doit JAMAIS faire échouer une inscription ou un paiement — échec loggé,
 * pas relancé (la fiche se réconciliera au prochain événement).
 *
 * Transport : le payload entier est porté par un jeton HMAC court (même
 * mécanique que les SSO, secret partagé CRM_SSO_SECRET) — pas de souci de
 * stabilité d'octets du body pour la signature.
 */

export type CRMEvent =
  | { type: "signup"; email: string; name?: string | null }
  | {
      type: "plan_change";
      email: string;
      name?: string | null;
      plan: "FREE" | "PRO" | "LABEL";
      previousPlan?: string | null;
    }
  | {
      type: "shop_addon";
      email: string;
      name?: string | null;
      enabled: boolean;
    };

export async function notifyCRM(event: CRMEvent): Promise<void> {
  const apiURL = process.env.CRM_API_URL;
  const secret = process.env.CRM_SSO_SECRET;
  if (!apiURL || !secret) return; // CRM non configuré : no-op silencieux

  try {
    const token = signSSOTokenWith(secret, { ...event }, SSO_AUD.crmWebhook);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(new URL("/api/v1/bandstream/webhook", apiURL), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.error(`CRM webhook ${event.type} failed: HTTP ${res.status}`);
    }
  } catch (err) {
    console.error(`CRM webhook ${event.type} failed:`, err);
  }
}
