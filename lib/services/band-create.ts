import prisma from '@/lib/prisma';
import { RESERVED_SUBDOMAINS } from '@/lib/middleware-utils/reserved-subdomains';

// 3 to 63 chars, lowercase alphanumeric, single hyphens allowed inside
export const DOMAINNAME_REGEX = /^[a-z0-9](-?[a-z0-9]){2,62}$/;

/**
 * Valide qu'un domainname est sûr à persister et à interpoler dans une
 * clé de stockage S3 (anti path-traversal). À utiliser sur TOUTE mise à
 * jour, pas seulement à la création.
 */
export function isValidDomainname(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    DOMAINNAME_REGEX.test(value) &&
    !RESERVED_SUBDOMAINS.includes(value)
  );
}

export function slugifyBandName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export type DomainCheckResult = {
  available: boolean;
  reason?: 'invalid' | 'reserved' | 'taken';
  suggestion?: string;
};

/**
 * Check a candidate domainname against format rules, reserved
 * subdomains and existing bands (published or not — the DB column
 * is @unique, so drafts block the name too).
 */
export async function checkDomainAvailability(
  domainname: string
): Promise<DomainCheckResult> {
  if (!DOMAINNAME_REGEX.test(domainname)) {
    return { available: false, reason: 'invalid' };
  }

  if (RESERVED_SUBDOMAINS.includes(domainname)) {
    return { available: false, reason: 'reserved' };
  }

  const existing = await prisma.band.findUnique({
    where: { domainname },
    select: { id: true },
  });

  if (!existing) {
    return { available: true };
  }

  // Suggest the first free numbered variant
  for (let i = 2; i <= 50; i++) {
    const candidate = `${domainname}${i}`.slice(0, 63);
    const taken = await prisma.band.findUnique({
      where: { domainname: candidate },
      select: { id: true },
    });
    if (!taken) {
      return { available: false, reason: 'taken', suggestion: candidate };
    }
  }

  return { available: false, reason: 'taken' };
}

export type CreateBandResult =
  | { ok: true; band: { id: number; name: string; domainname: string } }
  | { ok: false; error: 'invalid_name' | 'invalid' | 'reserved' | 'taken' };

/**
 * Create an unpublished band draft and link the creator as UserBand OWNER.
 * When `domainname` is omitted it is derived from the name and uniquified.
 */
export async function createBand(
  userId: string,
  name: string,
  domainname?: string
): Promise<CreateBandResult> {
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return { ok: false, error: 'invalid_name' };
  }

  let slug = domainname?.trim().toLowerCase() || slugifyBandName(trimmedName);

  if (domainname) {
    // Explicit slug: must be valid and free
    const check = await checkDomainAvailability(slug);
    if (!check.available) {
      return { ok: false, error: check.reason ?? 'taken' };
    }
  } else {
    // Derived slug: pad too-short names, then uniquify automatically
    if (slug.length < 3) {
      slug = `${slug}band`.slice(0, 63);
    }
    const check = await checkDomainAvailability(slug);
    if (!check.available) {
      if (check.reason === 'taken' && check.suggestion) {
        slug = check.suggestion;
      } else if (check.reason === 'reserved') {
        slug = `${slug}music`;
      } else {
        return { ok: false, error: check.reason ?? 'invalid' };
      }
    }
  }

  const band = await prisma.band.create({
    data: {
      name: trimmedName,
      domainname: slug,
      users: {
        create: {
          userId,
          role: 'OWNER',
        },
      },
    },
    select: { id: true, name: true, domainname: true },
  });

  return { ok: true, band };
}
