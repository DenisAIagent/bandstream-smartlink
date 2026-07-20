/**
 * Tests de non-régression — audit APP-04 (OTP en clair / énumération).
 * Exécution : node --test tests/otp.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { hashAuthCode } from "../lib/auth/otp.ts";

test("hashAuthCode : déterministe, hex 64 chars, ≠ clair", () => {
  const h1 = hashAuthCode("123456");
  const h2 = hashAuthCode("123456");
  assert.equal(h1, h2);
  assert.match(h1, /^[0-9a-f]{64}$/);
  assert.notEqual(h1, "123456");
});

test("hashAuthCode : codes proches → empreintes distinctes", () => {
  assert.notEqual(hashAuthCode("123456"), hashAuthCode("123457"));
});
