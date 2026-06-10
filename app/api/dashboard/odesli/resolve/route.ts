export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";
import { getOdesliLinks, PLATFORM_INFO } from "@/lib/services/odesli";

/**
 * Résout un lien de titre/album via Odesli (Songlink) et renvoie tous
 * les liens de plateformes correspondants — SANS rien écrire sur le
 * smartlink : le wizard pré-remplit ses champs et l'utilisateur garde
 * la main avant la sauvegarde. Les plateformes inconnues du catalogue
 * sont créées à la volée (catalogue global, source contrôlée).
 */
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const body = await req.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const odesli = await getOdesliLinks(url);

    const links: {
      platformId: number;
      shortname: string;
      name: string;
      baseURL: string;
      url: string;
    }[] = [];

    for (const link of odesli.platformLinks) {
      let platform = await prisma.platform.findUnique({
        where: { shortname: link.shortname },
      });

      if (!platform) {
        const info = PLATFORM_INFO[link.shortname];
        if (!info) continue;
        platform = await prisma.platform.create({
          data: {
            name: info.name,
            shortname: link.shortname,
            URL: info.url,
          },
        });
      }

      if (platform.deletedAt) continue;

      links.push({
        platformId: platform.id,
        shortname: platform.shortname,
        name: platform.name,
        baseURL: platform.URL,
        url: link.url,
      });
    }

    return NextResponse.json({
      links,
      title: odesli.title ?? null,
      thumbnailUrl: odesli.thumbnailUrl ?? null,
    });
  } catch (error) {
    console.error("Odesli resolve error:", error);
    const message = error instanceof Error ? error.message : "";

    // URL invalide ou page artiste : erreur d'entrée, pas serveur
    if (/Odesli API error \(4\d\d\)/.test(message)) {
      return NextResponse.json({ error: "unresolvable_url" }, { status: 422 });
    }

    return NextResponse.json(
      { error: "Failed to resolve url" },
      { status: 500 }
    );
  }
}
