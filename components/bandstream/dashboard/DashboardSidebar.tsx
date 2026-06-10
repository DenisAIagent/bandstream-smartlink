"use client";

import { Guitar, LifeBuoy, Settings, LogOut, SunIcon, MoonIcon } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import SupportBadge from "@/components/bandstream/support/SupportBadge";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { logout } from "@/components/auth/auth";
import LanguageSelector from "@/components/bandstream/i18n/LanguageSelector";

export default function DashboardSidebar() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const { theme, setTheme } = useTheme();

  function handleLightDarkModeClick() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold tracking-tight text-foreground">
            <Link href="/dashboard">band<span className="text-primary">.</span>stream</Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <Guitar />
                    <span>{t("my_artists")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/support">
                    <LifeBuoy />
                    <span>{t("support")}</span>
                    <span className="ml-auto">
                      <SupportBadge />
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>{t("settings")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <LanguageSelector />
        <SidebarMenuButton onClick={handleLightDarkModeClick}>
          {theme === "light" ? (
            <>
              <SunIcon className="mr-2 h-4 w-4" color="black" />
              <span>{tc("lightmode")}</span>
            </>
          ) : (
            <>
              <MoonIcon className="mr-2 h-4 w-4" color="yellow" />
              <span>{tc("darkmode")}</span>
            </>
          )}
        </SidebarMenuButton>
        <SidebarMenuButton onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{tc("logout")}</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
