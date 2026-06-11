export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";

/**
 * Droit à la portabilité (RGPD art. 20) : export JSON de toutes les données
 * personnelles du compte, téléchargeable depuis Réglages → Confidentialité.
 * Format structuré, lisible machine, sans données d'autres personnes
 * (les emails des membres d'équipe label sont inclus car c'est l'utilisateur
 * qui les a saisis ; les données des autres comptes ne le sont pas).
 */
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const email = session!.user?.email;
  if (!email) {
    return NextResponse.json({ error: "No email on session" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      email: true,
      name: true,
      phone: true,
      image: true,
      createdAt: true,
      subscription: {
        select: { plan: true, status: true, shopAddon: true, createdAt: true },
      },
      bands: {
        select: {
          role: true,
          band: {
            select: {
              name: true,
              domainname: true,
              bio: true,
              socials: true,
              createdAt: true,
              publishedAt: true,
              smartLinks: {
                where: { deletedAt: null },
                select: {
                  title: true,
                  slug: true,
                  template: true,
                  createdAt: true,
                  publishedAt: true,
                  platforms: {
                    select: { customURL: true, platform: { select: { name: true } } },
                  },
                },
              },
            },
          },
        },
      },
      labelTeam: { select: { email: true, createdAt: true } },
      tickets: {
        select: {
          subject: true,
          status: true,
          createdAt: true,
          messages: { select: { content: true, createdAt: true } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    format: "band.stream account export v1 (RGPD art. 20)",
    ...user,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="bandstream-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
