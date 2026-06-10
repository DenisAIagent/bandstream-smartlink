export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";

export async function GET() {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const userId = session!.user!.id!;
  const role = (session!.user as { role?: string }).role;
  const isAdmin = role && ["OWNER", "ADMIN"].includes(role);

  try {
    // Count OPEN tickets (the badge advertises "tickets that need action",
    // not unread messages — see #61). Admins see all OPEN tickets, customers
    // only their own.
    const count = await prisma.supportTicket.count({
      where: {
        status: "OPEN",
        ...(isAdmin ? {} : { userId }),
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
