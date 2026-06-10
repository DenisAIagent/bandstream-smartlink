import SupportTicketList from "@/components/bandstream/support/SupportTicketList";
import { useTranslations } from "next-intl";

export default function DashboardSupportPage() {
  const t = useTranslations("support");

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("support")}</h1>
      </div>
      <SupportTicketList basePath="/dashboard/support" />
    </div>
  );
}
