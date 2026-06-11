import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Jeton SSO signé app → boutique (bandstream-shop).
 * Format : base64url(JSON payload) + "." + base64url(HMAC-SHA256).
 * Durée de vie courte (60 s) : le jeton ne sert qu'à ouvrir la session
 * boutique, qui pose ensuite son propre cookie (bs_shop_session).
 * Le secret SHOP_SSO_SECRET doit être identique dans les deux apps.
 */

export const SSO_TOKEN_TTL_SECONDS = 60;

export interface ShopSSOPayload {
  email: string;
  name: string;
  /** Plan app principale : FREE | PRO | LABEL (la boutique remappe PRO → SOLO). */
  plan: "FREE" | "PRO" | "LABEL";
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

export function signShopSSOToken(
  data: Pick<ShopSSOPayload, "email" | "name" | "plan">
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: ShopSSOPayload = {
    ...data,
    iat: now,
    exp: now + SSO_TOKEN_TTL_SECONDS,
  };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = b64url(createHmac("sha256", getSecret()).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyShopSSOToken(token: string): ShopSSOPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", getSecret()).update(body).digest();
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
    ) as ShopSSOPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
