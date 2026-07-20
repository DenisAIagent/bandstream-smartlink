/**
 * Validation serveur des identifiants de tracking renseignés par les artistes.
 *
 * Ces valeurs sont interpolées dans des scripts inline (GTM/GA4/Meta) sur les
 * pages publiques : sans validation stricte, une apostrophe dans l'ID permet
 * une XSS stockée (cf. audit sécurité APP-01). On n'accepte que le format
 * canonique de chaque plateforme — aucun caractère de quote n'est possible.
 *
 * Module volontairement sans dépendance (testable via `node --test`).
 */

export type TrackingKind = "gtm" | "gtag" | "meta";

const PATTERNS: Record<TrackingKind, RegExp> = {
  // Google Tag Manager : GTM-XXXXXX (5 à 7 caractères alphanumériques)
  gtm: /^GTM-[A-Z0-9]{5,7}$/,
  // GA4 Measurement ID : G-XXXXXXXXXX (10 caractères alphanumériques)
  gtag: /^G-[A-Z0-9]{10}$/,
  // Meta Pixel ID : 15 à 16 chiffres
  meta: /^\d{15,16}$/,
};

/** Valeur vide acceptée (le tracking est optionnel). */
export function isValidTrackingId(kind: TrackingKind, value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (typeof value !== "string") return false;
  return PATTERNS[kind].test(value);
}

/**
 * Valide les trois champs de tracking d'un payload de mise à jour de band.
 * Retourne la clé du premier champ invalide, ou null si tout est valide.
 */
export function findInvalidTrackingField(body: Record<string, unknown>): string | null {
  if ("trackingGTM" in body && !isValidTrackingId("gtm", body.trackingGTM)) {
    return "trackingGTM";
  }
  if ("trackingGTAG" in body && !isValidTrackingId("gtag", body.trackingGTAG)) {
    return "trackingGTAG";
  }
  if ("trackingMeta" in body && !isValidTrackingId("meta", body.trackingMeta)) {
    return "trackingMeta";
  }
  return null;
}
