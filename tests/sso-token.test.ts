/**
 * Tests de non-régression — audit SSO-01 (jetons HMAC sans audience/iat).
 * Exécution : node --test tests/sso-token.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  signSSOTokenWith,
  verifySSOTokenWith,
  SSO_AUD,
  SSO_MAX_ACCEPTED_TTL_SECONDS,
} from "../lib/shop-sso.ts";

const SECRET = "test-secret-at-least-32-bytes-long!!";

function forge(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

test("round-trip signé/vérifié avec la bonne audience", () => {
  const token = signSSOTokenWith(SECRET, { email: "a@b.c", plan: "PRO" }, SSO_AUD.shop);
  const payload = verifySSOTokenWith(SECRET, token, { aud: SSO_AUD.shop });
  assert.ok(payload);
  assert.equal(payload.email, "a@b.c");
});

test("REFUS : un jeton émis pour un flux est rejeté par un autre (confusion)", () => {
  // Jeton webhook app→CRM présenté à la route SSO boutique
  const webhookToken = signSSOTokenWith(SECRET, { type: "signup", email: "x@y.z" }, SSO_AUD.crmWebhook);
  assert.equal(verifySSOTokenWith(SECRET, webhookToken, { aud: SSO_AUD.shop }), null);
  assert.equal(verifySSOTokenWith(SECRET, webhookToken, { aud: SSO_AUD.appAdminAccess }), null);
  // Jeton SSO agent présenté au webhook CRM
  const ssoToken = signSSOTokenWith(SECRET, { email: "agent@band.stream" }, SSO_AUD.crm);
  assert.equal(verifySSOTokenWith(SECRET, ssoToken, { aud: SSO_AUD.crmWebhook }), null);
});

test("REFUS : jeton longue durée (exp-iat > max) même bien signé", () => {
  const now = Math.floor(Date.now() / 1000);
  const token = forge({ aud: SSO_AUD.shop, email: "a@b.c", iat: now, exp: now + 3600 });
  assert.equal(verifySSOTokenWith(SECRET, token, { aud: SSO_AUD.shop }), null);
  // La limite par défaut est bien SSO_MAX_ACCEPTED_TTL_SECONDS
  assert.equal(SSO_MAX_ACCEPTED_TTL_SECONDS, 120);
});

test("REFUS : iat absent ou dans le futur", () => {
  const now = Math.floor(Date.now() / 1000);
  assert.equal(
    verifySSOTokenWith(SECRET, forge({ aud: SSO_AUD.shop, exp: now + 60 }), { aud: SSO_AUD.shop }),
    null
  );
  assert.equal(
    verifySSOTokenWith(SECRET, forge({ aud: SSO_AUD.shop, iat: now + 3600, exp: now + 3660 }), { aud: SSO_AUD.shop }),
    null
  );
});

test("REFUS : expiré, signature invalide, format cassé", () => {
  const now = Math.floor(Date.now() / 1000);
  assert.equal(
    verifySSOTokenWith(SECRET, forge({ aud: SSO_AUD.shop, iat: now - 300, exp: now - 10 }), { aud: SSO_AUD.shop }),
    null
  );
  const token = signSSOTokenWith(SECRET, { email: "a@b.c" }, SSO_AUD.shop);
  assert.equal(verifySSOTokenWith("autre-secret-32-bytes-long-!!!!!", token, { aud: SSO_AUD.shop }), null);
  assert.equal(verifySSOTokenWith(SECRET, "pas-un-jeton", { aud: SSO_AUD.shop }), null);
  assert.equal(verifySSOTokenWith(SECRET, token.slice(0, -4) + "AAAA", { aud: SSO_AUD.shop }), null);
});
