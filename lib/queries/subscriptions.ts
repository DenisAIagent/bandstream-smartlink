import prisma from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";

/**
 * Get the subscription for a user. Returns null if no subscription record exists.
 */
export async function getUserSubscription(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
  });
}

/**
 * Get the active plan for a user. Defaults to FREE if no subscription exists.
 */
export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return "FREE";
  if (subscription.status !== "ACTIVE") return "FREE";
  return subscription.plan;
}

/**
 * Check if a user has an active Pro subscription.
 */
export async function isProUser(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return plan === "PRO";
}
