/**
 * Subdomains that can never be claimed as a band domainname.
 * Shared between the middleware (customer detection) and the
 * band creation service (slug validation).
 */
export const RESERVED_SUBDOMAINS = [
  'internal',
  'dev',
  'cloud',
  'staging',
  'api',
  'auth',
  'www',
];
