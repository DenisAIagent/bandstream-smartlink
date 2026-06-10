import "@/app/globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/bandstream/theme-provider";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/bandstream/dashboard/DashboardSidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — band.stream",
  description: "Suivez les performances de vos pages artistes et de vos campagnes.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const t = await getTranslations("dashboard");

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                {t("home")}
              </Link>
            </Button>
          </header>
          <div>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
