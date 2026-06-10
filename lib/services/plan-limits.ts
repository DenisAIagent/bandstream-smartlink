import prisma from '@/lib/prisma';
import { SubscriptionPlan } from '@prisma/client';
import { getUserPlan } from '@/lib/queries/subscriptions';
import { PLAN_LIMITS } from '@/lib/plan-limits-shared';
import { getLabelContext } from '@/lib/services/label-team';

export { PLAN_LIMITS };

export type LimitCheck =
  | { allowed: true; plan: SubscriptionPlan; used: number; limit: number | null }
  | { allowed: false; plan: SubscriptionPlan; used: number; limit: number };

/**
 * L'utilisateur peut-il créer un nouvel artiste ?
 * Membre d'un label → le quota et le compteur sont ceux du GÉRANT
 * (les artistes du label appartiennent au gérant). Sinon : ses propres
 * bands OWNER contre son propre plan.
 */
export async function canCreateArtist(userId: string): Promise<LimitCheck> {
  const labelContext = await getLabelContext(userId);
  const quotaUserId = labelContext?.labelOwnerId ?? userId;
  const plan = await getUserPlan(quotaUserId);
  const limit = PLAN_LIMITS[plan].artists;

  const used = await prisma.band.count({
    where: {
      deletedAt: null,
      users: { some: { userId: quotaUserId, role: 'OWNER' } },
    },
  });

  if (limit === null || used < limit) {
    return { allowed: true, plan, used, limit };
  }
  return { allowed: false, plan, used, limit };
}

/**
 * L'utilisateur peut-il créer un nouveau smartlink sur cet artiste ?
 * Le plan qui gouverne est celui du PROPRIÉTAIRE du band (UserBand
 * OWNER) — un membre d'équipe FREE hérite donc des droits du compte
 * Pro/Label auquel appartient l'artiste.
 */
export async function canCreateSmartLink(
  userId: string,
  bandId: number
): Promise<LimitCheck> {
  const plan = await getBandOwnerPlan(bandId, userId);
  const limit = PLAN_LIMITS[plan].smartlinksPerArtist;

  const used = await prisma.smartLink.count({
    where: { bandId, deletedAt: null },
  });

  if (limit === null || used < limit) {
    return { allowed: true, plan, used, limit };
  }
  return { allowed: false, plan, used, limit };
}

/**
 * Plan du propriétaire d'un band (fallback : le plan de l'appelant).
 * Utilisé pour les droits liés au band (smartlinks, stats détaillées).
 */
export async function getBandOwnerPlan(
  bandId: number,
  fallbackUserId: string
): Promise<SubscriptionPlan> {
  const ownerLink = await prisma.userBand.findFirst({
    where: { bandId, role: 'OWNER' },
    select: { userId: true },
  });
  return getUserPlan(ownerLink?.userId ?? fallbackUserId);
}
