import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { notifyCRM } from "@/lib/crm-events";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Compute period end from a Stripe subscription.
 * In Stripe API v2026+, current_period_start/end were removed.
 * We derive the period end from cancel_at or trial_end, falling back to null.
 */
function getPeriodDates(sub: Stripe.Subscription) {
  const start = sub.start_date ? new Date(sub.start_date * 1000) : null;
  // cancel_at is the definitive end if set; otherwise trial_end or null
  const end = sub.cancel_at
    ? new Date(sub.cancel_at * 1000)
    : sub.trial_end
      ? new Date(sub.trial_end * 1000)
      : null;
  return { start, end };
}


/** Pousse le changement de plan vers la fiche client CRM (fire-and-forget). */
async function notifyPlanChange(
  userId: string,
  plan: "FREE" | "PRO" | "LABEL",
  previousPlan?: string | null
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user?.email) return;
  await notifyCRM({
    type: "plan_change",
    email: user.email,
    name: user.name,
    plan,
    previousPlan: previousPlan ?? null,
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("No userId in checkout session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) return;

  // Fetch the full subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const { start, end } = getPeriodDates(stripeSubscription);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: stripeSubscription.items.data[0]?.price.id || null,
      plan: "PRO",
      status: "ACTIVE",
      currentPeriodStart: start,
      currentPeriodEnd: end,
    },
    update: {
      stripeSubscriptionId: subscriptionId,
      stripePriceId: stripeSubscription.items.data[0]?.price.id || null,
      plan: "PRO",
      status: "ACTIVE",
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
    },
  });

  await notifyPlanChange(userId, "PRO");
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const existingSub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSub) return;

  const statusMap: Record<string, "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" | "INCOMPLETE"> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "UNPAID",
    incomplete: "INCOMPLETE",
  };

  const { start, end } = getPeriodDates(subscription);

  // Audit APP-05 : seuls les statuts réellement payants conservent PRO.
  // past_due = période de grâce (Stripe retente le prélèvement) ; si les
  // retentatives échouent, Stripe passe à unpaid/canceled → FREE. Avant ce
  // correctif, unpaid gardait PRO indéfiniment.
  const PRO_STATUSES = new Set(["active", "trialing", "past_due"]);
  const nextPlan = PRO_STATUSES.has(subscription.status) ? "PRO" : "FREE";
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: statusMap[subscription.status] || "ACTIVE",
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      plan: nextPlan,
    },
  });

  if (nextPlan !== existingSub.plan) {
    await notifyPlanChange(existingSub.userId, nextPlan, existingSub.plan);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existingSub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSub) return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "CANCELED",
      plan: "FREE",
      cancelAtPeriodEnd: false,
    },
  });

  await notifyPlanChange(existingSub.userId, "FREE", existingSub.plan);
}

/**
 * Remboursement TOTAL d'un paiement d'abonnement → retour au plan FREE
 * (audit APP-05 : un remboursement manuel dans Stripe ne rétrogradait pas
 * l'utilisateur, qui conservait PRO indéfiniment). Les remboursements
 * partiels ne changent rien. Les disputes (chargeback) restent à traiter
 * séparément (risque résiduel documenté).
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!charge.refunded) return; // remboursement partiel → pas de downgrade

  const invoiceRef = (charge as unknown as { invoice?: string | { id: string } | null }).invoice;
  const invoiceId = typeof invoiceRef === "string" ? invoiceRef : invoiceRef?.id;
  if (!invoiceId) return;

  const invoice = await stripe.invoices.retrieve(invoiceId);
  const subRef = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription;
  const subscriptionId = typeof subRef === "string" ? subRef : subRef?.id;
  if (!subscriptionId) return;

  const existingSub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (!existingSub || existingSub.plan === "FREE") return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      plan: "FREE",
      status: "CANCELED",
      cancelAtPeriodEnd: false,
    },
  });

  await notifyPlanChange(existingSub.userId, "FREE", existingSub.plan);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const sub = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription;
  const subscriptionId = typeof sub === "string" ? sub : sub?.id;
  if (!subscriptionId) return;

  const existingSub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!existingSub) return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: "PAST_DUE",
    },
  });
}
