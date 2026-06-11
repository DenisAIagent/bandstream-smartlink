export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/api-guard";

/**
 * Fiche client 360° pour le suivi et le support :
 * identité, plan, artistes du compte (avec smartlinks), équipe label,
 * tickets support.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id: userId } = await context.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true,
        stripeCustomerId: true,
        subscription: {
          select: { plan: true, status: true, currentPeriodEnd: true, shopAddon: true },
        },
        bands: {
          where: { band: { deletedAt: null } },
          select: {
            role: true,
            band: {
              select: {
                id: true,
                name: true,
                domainname: true,
                publishedAt: true,
                smartLinks: {
                  where: { deletedAt: null },
                  select: { id: true, publishedAt: true },
                },
              },
            },
          },
        },
        labelTeam: {
          select: { id: true, email: true, userId: true },
        },
        tickets: {
          orderBy: { updatedAt: "desc" },
          take: 10,
          select: {
            id: true,
            subject: true,
            status: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { bands, subscription, ...identity } = user;

    return NextResponse.json({
      ...identity,
      plan:
        subscription && subscription.status === "ACTIVE"
          ? subscription.plan
          : "FREE",
      shopAddon: Boolean(
        subscription?.shopAddon && subscription.status === "ACTIVE"
      ),
      subscription,
      artists: bands.map(({ role, band }) => ({
        id: band.id,
        name: band.name,
        domainname: band.domainname,
        publishedAt: band.publishedAt,
        memberRole: role,
        smartLinkCount: band.smartLinks.length,
        publishedSmartLinks: band.smartLinks.filter((sl) => sl.publishedAt).length,
      })),
    });
  } catch (error) {
    console.error("Error fetching user overview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
