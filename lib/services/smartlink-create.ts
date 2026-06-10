import prisma from '@/lib/prisma';
import { RESERVED_SLUGS } from '@/lib/middleware-utils/reserved-slugs';

// 2 à 63 caractères, minuscules/chiffres, tirets simples à l'intérieur
const SLUG_REGEX = /^[a-z0-9](-?[a-z0-9]){1,62}$/;

export function slugifyTitle(value: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

export type SlugCheckResult = {
  available: boolean;
  reason?: 'invalid' | 'reserved' | 'taken';
  suggestion?: string;
};

/**
 * Vérifie un slug pour un band donné : format, segments réservés
 * (locales, routes applicatives), unicité par band — soft-deleted inclus
 * (la contrainte DB bandId_slug couvre aussi les supprimés).
 */
export async function checkSlugAvailability(
  bandId: number,
  slug: string
): Promise<SlugCheckResult> {
  if (!SLUG_REGEX.test(slug)) {
    return { available: false, reason: 'invalid' };
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return { available: false, reason: 'reserved' };
  }

  const existing = await prisma.smartLink.findUnique({
    where: { bandId_slug: { bandId, slug } },
    select: { id: true },
  });

  if (!existing) {
    return { available: true };
  }

  for (let i = 2; i <= 50; i++) {
    const candidate = `${slug}-${i}`.slice(0, 63);
    const taken = await prisma.smartLink.findUnique({
      where: { bandId_slug: { bandId, slug: candidate } },
      select: { id: true },
    });
    if (!taken) {
      return { available: false, reason: 'taken', suggestion: candidate };
    }
  }

  return { available: false, reason: 'taken' };
}

export type CreateSmartLinkResult =
  | { ok: true; smartLink: { id: number; title: string; slug: string } }
  | { ok: false; error: 'invalid_title' | 'invalid' | 'reserved' | 'taken' };

/**
 * Crée un smartlink (brouillon, non publié). Si `slug` est omis, il est
 * dérivé du titre et uniquifié automatiquement.
 */
export async function createSmartLink(
  bandId: number,
  title: string,
  slug?: string
): Promise<CreateSmartLinkResult> {
  const trimmedTitle = title?.trim();
  if (!trimmedTitle) {
    return { ok: false, error: 'invalid_title' };
  }

  let candidate = slug?.trim().toLowerCase() || slugifyTitle(trimmedTitle);

  if (slug) {
    const check = await checkSlugAvailability(bandId, candidate);
    if (!check.available) {
      return { ok: false, error: check.reason ?? 'taken' };
    }
  } else {
    if (candidate.length < 2) {
      candidate = `${candidate || 'sortie'}-1`.replace(/^-/, 'sortie-');
    }
    if (RESERVED_SLUGS.includes(candidate)) {
      candidate = `${candidate}-1`;
    }
    const check = await checkSlugAvailability(bandId, candidate);
    if (!check.available) {
      if (check.reason === 'taken' && check.suggestion) {
        candidate = check.suggestion;
      } else {
        return { ok: false, error: check.reason ?? 'invalid' };
      }
    }
  }

  const smartLink = await prisma.smartLink.create({
    data: {
      bandId,
      title: trimmedTitle,
      slug: candidate,
    },
    select: { id: true, title: true, slug: true },
  });

  return { ok: true, smartLink };
}
