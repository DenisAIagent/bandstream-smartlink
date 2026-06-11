export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/api-guard";
import { notifyCRM } from "@/lib/crm-events";

const VALID_PLANS = ["FREE", "PRO", "LABEL"] as const;
type Plan = (typeof VALID_PLANS)[number];

/**
 * Changement de plan manuel par l'équipe band.stream (notamment
 * l'activation des comptes LABEL, vendus hors checkout self-serve).
 * Upsert de la Subscription en statut ACTIVE — sans toucher aux champs
 * Stripe existants (un abonné Stripe passé LABEL garde son customer id).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id: userId } = await context.params;

  try {
    const body = await req.json();
    const plan = body.plan as Plan;

    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, subscription: { select: { plan: true } } },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        plan,
        status: "ACTIVE",
      },
    });

    if (user.email) {
      await notifyCRM({
        type: "plan_change",
        email: user.email,
        name: user.name,
        plan,
        previousPlan: user.subscription?.plan ?? "FREE",
      });
    }

    return NextResponse.json({ plan: subscription.plan });
  } catch (error) {
    console.error("Error updating user plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}
