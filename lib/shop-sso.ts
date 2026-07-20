import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Jeton SSO signé app → boutique (bandstream-shop).
 * Format : base64url(JSON payload) + "." + base64url(HMAC-SHA256).
 * Durée de vie courte (60 s) : le jeton ne sert qu'à ouvrir la session
 * boutique, qui pose ensuite son propre cookie (bs_shop_session).
 * Le secret SHOP_SSO_SECRET doit être identique dans les deux apps.
 *
 * Audit SSO-01 : chaque flux porte une `aud` (audience) vérifiée à la
 * réception — un jeton émis pour un flux n'est plus accepté par un autre —
 * et le récepteur impose `exp - iat ≤ MAX_ACCEPTED_TTL_S` pour refuser un
 * jeton longue durée forgé par un émetteur compromis ou buggé.
 */

export const SSO_TOKEN_TTL_SECONDS = 60;

/** Durée de vie maximale acceptée à la réception (marge au-dessus des 60 s émis). */
export const SSO_MAX_ACCEPTED_TTL_SECONDS = 120;

/** Audiences des flux SSO/webhook de l'écosystème. */
export const SSO_AUD = {
  /** app → boutique : ouverture de session back-office boutique. */
  shop: "shop-sso",
  /** app → CRM : connexion d'un agent au CRM. */
  crm: "crm-sso",
  /** app → CRM : événements clients (webhook signé). */
  crmWebhook: "crm-webhook",
  /** CRM → app : accès support superadmin à une fiche client. */
  appAdminAccess: "app-admin-access",
} as const;

export interface ShopSSOPayload {
  email: string;
  name: string;
  /** Plan app principale : FREE | PRO | LABEL (la boutique remappe PRO → SOLO). */
  plan: "FREE" | "PRO" | "LABEL";
  aud: string;
  iat: number;
  exp: number;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function getSecret(): string {
  const secret = process.env.SHOP_SSO_SECRET;
  if (!secret) {
    throw new Error("SHOP_SSO_SECRET is not configured");
  }
  return secret;
}

/**
 * Signe un jeton SSO court (60 s) avec un secret arbitraire — utilisé pour
 * la boutique (SHOP_SSO_SECRET) et le CRM interne (CRM_SSO_SECRET).
 * `aud` identifie le flux destinataire et est vérifié à la réception.
 */
export function signSSOTokenWith(
  secret: string,
  data: Record<string, unknown>,
  aud: string
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = { ...data, aud, iat: now, exp: now + SSO_TOKEN_TTL_SECONDS };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = b64url(createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

export function signShopSSOToken(
  data: Pick<ShopSSOPayload, "email" | "name" | "plan">
): string {
  return signSSOTokenWith(getSecret(), data, SSO_AUD.shop);
}

export interface VerifySSOOptions {
  /** Audience attendue — le jeton est refusé si `payload.aud` diffère. */
  aud: string;
  /** Durée de vie maximale acceptée (défaut : SSO_MAX_ACCEPTED_TTL_SECONDS). */
  maxTtlSeconds?: number;
}

/**
 * Vérifie un jeton SSO signé avec un secret arbitraire (miroir de
 * signSSOTokenWith). Contrôles : HMAC temps constant, `aud` exacte, `exp`
 * non expiré, `iat` présent et non futur, `exp - iat` borné (anti jeton
 * longue durée). L'anti-rejeu strict (jti à usage unique) reste un chantier
 * séparé nécessitant un stockage partagé côté récepteur.
 */
export function verifySSOTokenWith<T extends { aud?: string; iat?: number; exp?: number }>(
  secret: string,
  token: string,
  options: VerifySSOOptions
): T | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest();
  const provided = Buffer.from(sig, "base64url");
  if (
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as T;
    const now = Date.now() / 1000;
    const maxTtl = options.maxTtlSeconds ?? SSO_MAX_ACCEPTED_TTL_SECONDS;
    if (payload.aud !== options.aud) return null;
    if (typeof payload.exp !== "number" || payload.exp < now) return null;
    if (typeof payload.iat !== "number") return null;
    // iat dans le futur (marge 60 s de dérive d'horloge) → refus
    if (payload.iat > now + 60) return null;
    // Jeton à durée de vie anormale → refus
    if (payload.exp - payload.iat > maxTtl) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyShopSSOToken(token: string): ShopSSOPayload | null {
  return verifySSOTokenWith<ShopSSOPayload>(getSecret(), token, { aud: SSO_AUD.shop });
}
