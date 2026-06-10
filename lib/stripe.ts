import Stripe from "stripe";

if (!process.env.STRIPE_API_KEY) {
  throw new Error("STRIPE_API_KEY is not set in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export default stripe;

/**
 * Plans configuration.
 * STRIPE_PRICE_ID_PRO must be set to the Stripe Price ID for the Pro plan.
 * Create the product and price in the Stripe Dashboard first.
 */
export const PLANS = {
  FREE: {
    name: "Free",
    description: "Everything you need to get started.",
    features: [
      "Custom artist page",
      "All streaming platform links",
      "Events and ticketing",
      "Your .band.stream subdomain",
      "27 languages",
    ],
    limits: {
      maxBands: 1,
      analytics: false,
      trackingPixels: false,
      prioritySupport: false,
    },
  },
  PRO: {
    name: "Pro",
    description: "For artists who want to grow.",
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || "",
    features: [
      "Everything in Free",
      "Detailed visitor analytics",
      "Google Tag Manager & Meta Pixel",
      "Priority support",
      "Pro badge on your page",
    ],
    limits: {
      maxBands: 10,
      analytics: true,
      trackingPixels: true,
      prioritySupport: true,
    },
  },
} as const;
