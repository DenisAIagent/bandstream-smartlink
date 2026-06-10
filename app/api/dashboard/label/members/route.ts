export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";
import { getUserPlan } from "@/lib/queries/subscriptions";
import { addLabelMember, LABEL_SEATS } from "@/lib/services/label-team";

/** Seul le gérant (plan LABEL) gère son équipe. */
async function requireLabelOwner(userId: string) {
  const plan = await getUserPlan(userId);
  return plan === "LABEL";
}

export async function GET() {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;
  const userId = session!.user!.id as string;

  if (!(await requireLabelOwner(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const members = await prisma.labelMember.findMany({
      where: { labelOwnerId: userId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        userId: true,
        createdAt: true,
        user: { select: { name: true, image: true } },
      },
    });

    return NextResponse.json({
      seats: LABEL_SEATS,
      used: 1 + members.length,
      members,
    });
  } catch (error) {
    console.error("Error fetching label members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;
  const userId = session!.user!.id as string;

  if (!(await requireLabelOwner(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = await addLabelMember(userId, body.email ?? "");

    if (!result.ok) {
      const status = result.error === "seats_limit" ? 403 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.member, { status: 201 });
  } catch (error) {
    console.error("Error adding label member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
