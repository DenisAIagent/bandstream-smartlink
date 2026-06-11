"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Download, ShieldAlert, Loader2 } from "lucide-react";
import { logout } from "@/components/auth/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Réglages → Confidentialité : exercice direct des droits RGPD.
 *  - Export des données (art. 20) : téléchargement JSON immédiat.
 *  - Suppression du compte (art. 17) : confirmation par saisie de
 *    « SUPPRIMER », artistes dépubliés immédiatement, purge à 30 jours.
 */
export default function PrivacyRights() {
  const t = useTranslations("settings");
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/dashboard/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      if (res.status === 403) {
        toast({ title: t("delete_internal_blocked"), variant: "destructive" });
        return;
      }
      if (!res.ok) throw new Error("deletion failed");
      toast({ title: t("delete_done"), duration: 4000 });
      await logout();
    } catch {
      toast({ title: t("delete_error"), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="h-5 w-5" />
        <h2 className="text-lg font-semibold">{t("privacy_title")}</h2>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{t("export_title")}</p>
            <p className="text-xs text-muted-foreground">{t("export_desc")}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="/api/dashboard/account/export" download>
              <Download className="h-4 w-4 mr-2" />
              {t("export_cta")}
            </a>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t pt-5">
          <div>
            <p className="text-sm font-medium text-destructive">{t("delete_title")}</p>
            <p className="text-xs text-muted-foreground">{t("delete_desc")}</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                {t("delete_cta")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("delete_confirm_title")}</DialogTitle>
                <DialogDescription>{t("delete_confirm_desc")}</DialogDescription>
              </DialogHeader>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={t("delete_confirm_placeholder")}
                autoComplete="off"
              />
              <DialogFooter>
                <Button
                  variant="destructive"
                  disabled={confirmText !== t("delete_confirm_word") || deleting}
                  onClick={handleDelete}
                >
                  {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t("delete_confirm_cta")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
