import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Lock, ExternalLink, Check } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Add-on « Boutique merch » — accès à bandstream-shop depuis l'espace admin.
 * Verrouillé par défaut : page d'upgrade tant que Subscription.shopAddon
 * est inactif (activation manuelle par l'équipe, comme le plan Label).
 * Une fois actif : ouverture de la boutique dans un nouvel onglet via le
 * pont SSO (/api/dashboard/shop/sso) — pas de nouvelle connexion.
 */
export default async function AdminShopPage() {
  const ta = await getTranslations("admin");
  const session = await auth();
  const email = session?.user?.email;

  const user = email
    ? await prisma.user.findUnique({
        where: { email },
        select: {
          subscription: { select: { plan: true, shopAddon: true, status: true } },
        },
      })
    : null;

  const sub = user?.subscription;
  const plan = sub?.plan ?? "FREE";
  const active = Boolean(sub?.shopAddon && sub.status === "ACTIVE" && plan !== "FREE");

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Store className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{ta("shop")}</h1>
          <Badge variant={active ? "default" : "secondary"}>
            {active ? ta("shop_active_badge") : ta("shop_addon_tag")}
          </Badge>
        </div>

        {active ? (
          <Card>
            <CardHeader>
              <CardTitle>{ta("shop_active_title")}</CardTitle>
              <CardDescription>{ta("shop_active_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button asChild size="lg" className="w-fit">
                <a href="/api/dashboard/shop/sso" target="_blank" rel="noopener">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {ta("shop_open_cta")}
                </a>
              </Button>
              <p className="text-sm text-muted-foreground">{ta("shop_sso_note")}</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{ta("shop_locked_title")}</CardTitle>
              </div>
              <CardDescription>{ta("shop_locked_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{ta("shop_pricing_pro")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{ta("shop_pricing_label")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{ta("shop_pricing_features")}</span>
                </li>
              </ul>
              {plan === "FREE" && (
                <p className="text-sm text-muted-foreground">{ta("shop_free_note")}</p>
              )}
              <Button asChild size="lg" className="w-fit">
                <a href="mailto:denis@band.stream?subject=Activation%20add-on%20Boutique">
                  {ta("shop_upgrade_cta")}
                </a>
              </Button>
              <p className="text-xs text-muted-foreground">{ta("shop_manual_note")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
