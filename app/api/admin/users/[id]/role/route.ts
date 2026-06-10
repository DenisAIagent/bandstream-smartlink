export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/api-guard";

const VALID_ROLES = ["CUSTOMER", "ADMIN", "OWNER"] as const;
type Role = (typeof VALID_ROLES)[number];

/**
 * Nomination des admins internes band.stream (suivi client / support).
 * Réservé aux OWNER (superadmins) ; on ne peut pas changer son propre
 * rôle (évite de se retirer l'accès par erreur).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAdmin();
  if (authError) return authError;

  if ((session!.user as { role?: string }).role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: userId } = await context.params;

  if (userId === session!.user!.id) {
    return NextResponse.json({ error: "cannot_change_own_role" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const role = body.role as Role;

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
