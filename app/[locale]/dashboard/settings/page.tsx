"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Check, Loader2 } from "lucide-react";
import LabelTeam from "@/components/bandstream/dashboard/LabelTeam";
import PrivacyRights from "@/components/bandstream/dashboard/PrivacyRights";

interface SubscriptionInfo {
  plan: "FREE" | "PRO" | "LABEL";
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const billingStatus = searchParams.get("billing");

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      const res = await fetch("/api/stripe/subscription");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "checkout failed");
      }
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: t("payment_error_title"),
        description: t("payment_error_hint"),
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleManageBilling() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "portal failed");
      }
      window.location.href = data.url;
    } catch (error) {
      console.error("Error opening billing portal:", error);
      toast({
        title: t("payment_error_title"),
        description: t("payment_error_hint"),
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  const isPro =
    (subscription?.plan === "PRO" || subscription?.plan === "LABEL") &&
    subscription?.status === "ACTIVE";

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

      {billingStatus === "success" && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200">
          {t("upgrade_success")}
        </div>
      )}
      {billingStatus === "canceled" && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
          {t("upgrade_canceled")}
        </div>
      )}

      <div className="space-y-6">
        {/* Subscription Section */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t("subscription")}</h2>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("loading")}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{t("current_plan")}:</span>
                <span className={`font-semibold px-2 py-1 rounded text-sm ${
                  isPro
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {subscription?.plan || "FREE"}
                </span>
              </div>

              {isPro && subscription?.currentPeriodEnd && (
                <div className="text-sm text-muted-foreground">
                  {subscription.cancelAtPeriodEnd
                    ? t("cancels_on", { date: new Date(subscription.currentPeriodEnd).toLocaleDateString(locale) })
                    : t("renews_on", { date: new Date(subscription.currentPeriodEnd).toLocaleDateString(locale) })
                  }
                </div>
              )}

              {isPro ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">{t("pro_features")}:</p>
                    <ul className="space-y-1">
                      {["analytics", "tracking_pixels", "priority_support", "pro_badge", "more_artists"].map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          {t(`feature_${feature}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleManageBilling}
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t("manage_billing")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t("upgrade_hint")}</p>
                  <Button
                    onClick={handleUpgrade}
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t("upgrade_to_pro")}
                  </Button>
                  <p className="text-xs text-muted-foreground">{t("upgrade_price")}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Équipe du label (visible uniquement pour les comptes LABEL) */}
        <LabelTeam />

        {/* Confidentialité — droits RGPD (export art. 20, suppression art. 17) */}
        <PrivacyRights />
      </div>
    </div>
  );
}
