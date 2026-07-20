/**
 * Tests de non-régression — audit APP-01 (XSS stockée via IDs de tracking).
 * Exécution : node --test tests/tracking-ids.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidTrackingId, findInvalidTrackingField } from "../lib/tracking/tracking-ids.ts";

test("formats canoniques acceptés", () => {
  assert.equal(isValidTrackingId("gtm", "GTM-ABC123"), true);
  assert.equal(isValidTrackingId("gtm", "GTM-5K2L9PZ"), true);
  assert.equal(isValidTrackingId("gtag", "G-ABC123XYZ9"), true);
  assert.equal(isValidTrackingId("meta", "123456789012345"), true);
  assert.equal(isValidTrackingId("meta", "1234567890123456"), true);
});

test("valeurs vides acceptées (tracking optionnel)", () => {
  assert.equal(isValidTrackingId("gtm", ""), true);
  assert.equal(isValidTrackingId("gtm", null), true);
  assert.equal(isValidTrackingId("gtag", undefined), true);
  assert.equal(isValidTrackingId("meta", ""), true);
});

test("payloads XSS rejetés — aucune quote ne passe", () => {
  // Payload utilisé dans l'audit : sortie de chaîne JS par apostrophe
  assert.equal(isValidTrackingId("gtm", "X');alert(1)//"), false);
  assert.equal(isValidTrackingId("gtag", "G-AAAA');fetch('https://evil.tld')//"), false);
  assert.equal(isValidTrackingId("meta", "1');alert(document.domain)//"), false);
  // Variantes courantes
  assert.equal(isValidTrackingId("gtm", 'GTM-AAA"onload="alert(1)'), false);
  assert.equal(isValidTrackingId("gtm", "GTM-abc123"), false); // minuscules refusées
  assert.equal(isValidTrackingId("gtm", "GTM-"), false);
  assert.equal(isValidTrackingId("gtag", "G-ABC"), false);
  assert.equal(isValidTrackingId("meta", "12345"), false);
  assert.equal(isValidTrackingId("gtm", 12345), false);
});

test("findInvalidTrackingField signale le champ fautif", () => {
  assert.equal(findInvalidTrackingField({ trackingGTM: "GTM-OK123" }), null);
  assert.equal(findInvalidTrackingField({ name: "x", trackingMeta: "0';alert(1)//" }), "trackingMeta");
  assert.equal(findInvalidTrackingField({ trackingGTAG: "nope" }), "trackingGTAG");
  assert.equal(findInvalidTrackingField({}), null);
});
