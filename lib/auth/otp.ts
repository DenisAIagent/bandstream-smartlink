import crypto from "crypto";

/**
 * Empreinte du code OTP de connexion (audit APP-04) : seul ce hachage
 * SHA-256 est stocké en base et comparé — jamais le code en clair.
 * Module partagé entre la server action d'émission et le provider Auth.js.
 */
export function hashAuthCode(code: string): string {
  return crypto.createHash("sha256").update(code, "utf8").digest("hex");
}
