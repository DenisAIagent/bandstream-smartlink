export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/api-guard";

/**
 * Activation manuelle des add-ons par l'équipe band.stream (fiche client
 * 360°). V1.1 : un seul add-on, « Boutique merch » — +10 €/mois (Pro,
 * 1 boutique), +30 €/mois (Label, 100 boutiques). FREE non éligible.
 * L'app principale est la source de vérité ; la boutique se synchronise
 * lors du SSO.
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
    const shopAddon = body.shopAddon;

    if (typeof shopAddon !== "boolean") {
      return NextResponse.json({ error: "Invalid addon value" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, subscription: { select: { plan: true } } },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = user.subscription?.plan ?? "FREE";
    if (shopAddon && plan === "FREE") {
      return NextResponse.json(
        { error: "addon_requires_paid_plan" },
        { status: 422 }
      );
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      create: { userId, plan, status: "ACTIVE", shopAddon },
      update: { shopAddon },
    });

    return NextResponse.json({ shopAddon: subscription.shopAddon });
  } catch (error) {
    console.error("Error updating user addons:", error);
    return NextResponse.json(
      { error: "Failed to update addons" },
      { status: 500 }
    );
  }
}
