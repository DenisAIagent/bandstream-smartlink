type RateLimitEntry = {
  count: number;
  firstAttempt: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.firstAttempt > 15 * 60 * 1000) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check rate limit for a given key and action.
 * @param key - Identifier (email or IP)
 * @param action - "otp-request" or "otp-verify"
 * @returns true if the request is allowed, false if rate limited
 */
export function checkRateLimit(key: string, action: "otp-request" | "otp-verify"): boolean {
  const maxAttempts = action === "otp-request" ? 3 : 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const mapKey = `${action}:${key}`;
  const now = Date.now();

  const entry = rateLimitMap.get(mapKey);

  if (!entry || now - entry.firstAttempt > windowMs) {
    rateLimitMap.set(mapKey, { count: 1, firstAttempt: now });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false;
  }

  entry.count++;
  return true;
}
