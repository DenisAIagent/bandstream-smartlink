import prisma from '@/lib/prisma';
import { getUserPlan } from '@/lib/queries/subscriptions';

/** 5 utilisateurs au total par compte Label : le gérant + 4 invités. */
export const LABEL_SEATS = 5;

/**
 * Contexte label d'un utilisateur :
 * - gérant (plan LABEL)            → { labelOwnerId: lui-même, isOwner: true }
 * - membre invité d'un label       → { labelOwnerId: le gérant, isOwner: false }
 * - sinon                          → null
 */
export async function getLabelContext(
  userId: string
): Promise<{ labelOwnerId: string; isOwner: boolean } | null> {
  const plan = await getUserPlan(userId);
  if (plan === 'LABEL') {
    return { labelOwnerId: userId, isOwner: true };
  }

  const membership = await prisma.labelMember.findFirst({
    where: { userId },
    select: { labelOwnerId: true },
  });
  if (membership) {
    // Le label du gérant doit toujours être actif
    const ownerPlan = await getUserPlan(membership.labelOwnerId);
    if (ownerPlan === 'LABEL') {
      return { labelOwnerId: membership.labelOwnerId, isOwner: false };
    }
  }

  return null;
}

/** Bands du label = bands actifs dont le gérant est UserBand OWNER. */
export async function getLabelBandIds(labelOwnerId: string): Promise<number[]> {
  const bands = await prisma.band.findMany({
    where: {
      deletedAt: null,
      users: { some: { userId: labelOwnerId, role: 'OWNER' } },
    },
    select: { id: true },
  });
  return bands.map((b) => b.id);
}

/**
 * Donne accès à un membre (UserBand MEMBER) sur tous les bands du label.
 * Idempotent (skipDuplicates).
 */
export async function materializeMemberAccess(
  labelOwnerId: string,
  memberUserId: string
): Promise<void> {
  const bandIds = await getLabelBandIds(labelOwnerId);
  if (bandIds.length === 0) return;

  await prisma.userBand.createMany({
    data: bandIds.map((bandId) => ({
      userId: memberUserId,
      bandId,
      role: 'MEMBER' as const,
    })),
    skipDuplicates: true,
  });
}

/**
 * Donne accès à tous les membres résolus du label sur un band donné
 * (appelé à la création d'un artiste par le label).
 */
export async function materializeBandAccess(
  labelOwnerId: string,
  bandId: number,
  excludeUserId?: string
): Promise<void> {
  const members = await prisma.labelMember.findMany({
    where: { labelOwnerId, userId: { not: null } },
    select: { userId: true },
  });

  const data = members
    .map((m) => m.userId!)
    .filter((id) => id !== labelOwnerId && id !== excludeUserId)
    .map((userId) => ({ userId, bandId, role: 'MEMBER' as const }));

  if (data.length > 0) {
    await prisma.userBand.createMany({ data, skipDuplicates: true });
  }
}

export type AddMemberResult =
  | { ok: true; member: { id: number; email: string; userId: string | null } }
  | { ok: false; error: 'seats_limit' | 'already_member' | 'invalid_email' | 'is_owner' };

/**
 * Invite un membre par email. Si le compte existe → accès immédiat ;
 * sinon une UserInvite est créée (l'auth n'accepte que les invités) et
 * l'accès sera matérialisé à sa première connexion (cf. auth.ts).
 */
export async function addLabelMember(
  labelOwnerId: string,
  rawEmail: string
): Promise<AddMemberResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: 'invalid_email' };
  }

  const owner = await prisma.user.findUnique({
    where: { id: labelOwnerId },
    select: { email: true },
  });
  if (owner?.email?.toLowerCase() === email) {
    return { ok: false, error: 'is_owner' };
  }

  const existing = await prisma.labelMember.findUnique({
    where: { labelOwnerId_email: { labelOwnerId, email } },
  });
  if (existing) {
    return { ok: false, error: 'already_member' };
  }

  // Sièges après ajout = gérant (1) + membres existants + le nouveau
  const seatCount = await prisma.labelMember.count({ where: { labelOwnerId } });
  if (1 + seatCount + 1 > LABEL_SEATS) {
    return { ok: false, error: 'seats_limit' };
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true },
  });

  const member = await prisma.labelMember.create({
    data: {
      labelOwnerId,
      email,
      userId: user?.id ?? null,
    },
    select: { id: true, email: true, userId: true },
  });

  if (user) {
    await materializeMemberAccess(labelOwnerId, user.id);
  } else {
    // Permettre l'inscription (acceptOnlyInvitedUsers)
    const invited = await prisma.userInvite.findFirst({ where: { email } });
    if (!invited) {
      await prisma.userInvite.create({
        data: { email, invitedById: labelOwnerId },
      });
    }
  }

  return { ok: true, member };
}

/**
 * Retire un membre : supprime son accès aux bands du label
 * (UserBand non-OWNER uniquement) puis la ligne LabelMember.
 */
export async function removeLabelMember(
  labelOwnerId: string,
  memberId: number
): Promise<boolean> {
  const member = await prisma.labelMember.findFirst({
    where: { id: memberId, labelOwnerId },
  });
  if (!member) return false;

  if (member.userId) {
    const bandIds = await getLabelBandIds(labelOwnerId);
    if (bandIds.length > 0) {
      await prisma.userBand.deleteMany({
        where: {
          userId: member.userId,
          bandId: { in: bandIds },
          role: { not: 'OWNER' },
        },
      });
    }
  }

  await prisma.labelMember.delete({ where: { id: memberId } });
  return true;
}

/**
 * À la connexion : rattache les invitations label en attente pour cet
 * email (userId null) et matérialise les accès.
 */
export async function resolveLabelMemberships(
  userId: string,
  email: string
): Promise<void> {
  const pending = await prisma.labelMember.findMany({
    where: { email: email.trim().toLowerCase(), userId: null },
  });

  for (const membership of pending) {
    await prisma.labelMember.update({
      where: { id: membership.id },
      data: { userId },
    });
    await materializeMemberAccess(membership.labelOwnerId, userId);
  }
}
