export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import stripe, { PLANS } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";

export async function POST() {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const userId = session!.user!.id as string;
  const userEmail = session!.user!.email as string;

  if (!PLANS.PRO.stripePriceId) {
    return NextResponse.json(
      { error: "Pro plan price is not configured" },
      { status: 500 }
    );
  }

  try {
    // Check if user already has an active Pro subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSubscription?.plan === "PRO" && existingSubscription.status === "ACTIVE") {
      return NextResponse.json(
        { error: "You already have an active Pro subscription" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId = (
      await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
      })
    )?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const rootDomainUrl = process.env.ROOT_DOMAIN_URL || "https://band.stream";

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PLANS.PRO.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${rootDomainUrl}/dashboard/settings?billing=success`,
      cancel_url: `${rootDomainUrl}/dashboard/settings?billing=canceled`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
