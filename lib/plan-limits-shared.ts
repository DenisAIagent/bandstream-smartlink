/**
 * Grille des droits par plan — importable côté client ET serveur
 * (aucune dépendance Prisma). `null` = illimité.
 *
 *   FREE  → 1 artiste,   1 smartlink par artiste
 *   PRO   → 1 artiste,   smartlinks illimités
 *   LABEL → 100 artistes, smartlinks illimités
 */
export type PlanName = 'FREE' | 'PRO' | 'LABEL';

export const PLAN_LIMITS: Record<
  PlanName,
  { artists: number | null; smartlinksPerArtist: number | null }
> = {
  FREE: { artists: 1, smartlinksPerArtist: 1 },
  PRO: { artists: 1, smartlinksPerArtist: null },
  LABEL: { artists: 100, smartlinksPerArtist: null },
};
