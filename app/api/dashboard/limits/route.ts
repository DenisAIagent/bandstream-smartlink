export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-guard";
import { canCreateArtist } from "@/lib/services/plan-limits";
import { getLabelContext } from "@/lib/services/label-team";

/**
 * Limites effectives de l'utilisateur courant (label-aware) :
 * pour un membre d'équipe label, le plan/quota affichés sont ceux du label.
 */
export async function GET() {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;
  const userId = session!.user!.id as string;

  try {
    const [artistCheck, labelContext] = await Promise.all([
      canCreateArtist(userId),
      getLabelContext(userId),
    ]);

    return NextResponse.json({
      plan: artistCheck.plan,
      artists: {
        used: artistCheck.used,
        limit: artistCheck.limit,
        canCreate: artistCheck.allowed,
      },
      label: labelContext
        ? { isOwner: labelContext.isOwner }
        : null,
    });
  } catch (error) {
    console.error("Error fetching limits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
