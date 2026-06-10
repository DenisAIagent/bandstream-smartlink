export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-guard";
import { getUserSubscription } from "@/lib/queries/subscriptions";

export async function GET() {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const userId = session!.user!.id as string;

  try {
    const subscription = await getUserSubscription(userId);

    return NextResponse.json({
      plan: subscription?.plan || "FREE",
      status: subscription?.status || "ACTIVE",
      currentPeriodEnd: subscription?.currentPeriodEnd || null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
