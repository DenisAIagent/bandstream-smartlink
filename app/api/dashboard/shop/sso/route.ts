export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";
import { signShopSSOToken } from "@/lib/shop-sso";

/**
 * Pont SSO app → boutique merch (bandstream-shop).
 * Réservé aux comptes dont l'add-on « Boutique » est actif : signe un jeton
 * court (60 s) et redirige vers la route /sso/bandstream de la boutique,
 * qui ouvre sa propre session — pas besoin de se reconnecter.
 * S'ouvre dans un nouvel onglet depuis /admin/shop.
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
      name: true,
      email: true,
      subscription: { select: { plan: true, shopAddon: true, status: true } },
    },
  });

  const sub = user?.subscription;
  if (!sub?.shopAddon || sub.status !== "ACTIVE" || sub.plan === "FREE") {
    return NextResponse.json({ error: "shop_addon_required" }, { status: 403 });
  }

  const shopURL = process.env.SHOP_PUBLIC_URL;
  if (!shopURL || !process.env.SHOP_SSO_SECRET) {
    console.error("Shop SSO misconfigured: SHOP_PUBLIC_URL / SHOP_SSO_SECRET missing");
    return NextResponse.json({ error: "shop_not_configured" }, { status: 503 });
  }

  const token = signShopSSOToken({
    email,
    name: user?.name ?? email.split("@")[0],
    plan: sub.plan,
  });

  const target = new URL("/sso/bandstream", shopURL);
  target.searchParams.set("token", token);
  return NextResponse.redirect(target.toString(), 302);
}
