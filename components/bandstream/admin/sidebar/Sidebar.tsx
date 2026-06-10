import { Guitar, Podcast, User, ChartNoAxesColumn, LifeBuoy } from "lucide-react"
import Link from "next/link"
import { getRolePermission } from "@/components/auth/RoleGuard"
import {
  Sidebar,
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import BandStreamSidebarFooter from "@/components/bandstream/admin/sidebar/BandStreamSidebarFooter"
import SupportBadge from "@/components/bandstream/support/SupportBadge"

import {getTranslations, getLocale} from 'next-intl/server';

import { getPlatformsCount } from "@/lib/queries/platforms"
import { getUserBandsCount } from "@/lib/queries/bands"
import { getUsersCount, getBetaInvitesCount } from "@/lib/queries/users"

export async function AppSidebar() {
  const platformsCount = await getPlatformsCount()
  // Fallback défensif : la sidebar ne doit jamais faire planter la page admin
  const userBandsCount = await getUserBandsCount().catch(() => 0)
  const isOwner = await getRolePermission("OWNER")
  const usersCount = isOwner ? await getUsersCount() : 0
  const betaInvitesCount = isOwner ? await getBetaInvitesCount() : 0
  const ta = await getTranslations('admin');
  const tc = await getTranslations('common');
  const to = await getTranslations('owner');
  const locale = await getLocale();
  const lp = (path: string) => `/${locale}${path}`;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold tracking-tight text-foreground">
            <Link href={lp("/admin")}>
              band<span className="text-primary">.</span>stream
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={lp("/admin/profile")}>
                    <User />
                    <span>{ta('profile')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {await getRolePermission("OWNER") && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={lp("/admin/users")}>
                      <Podcast />
                      <span>{to('users')}</span>
                      <span className="ml-auto">
                        {usersCount}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {await getRolePermission("OWNER") && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={lp("/admin/beta")}>
                      <Podcast />
                      <span>{to('betainvites')}</span>
                      <span className="ml-auto">
                        {betaInvitesCount}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={lp("/admin/bands")}>
                    <Guitar />
                    <span>{tc('bands')}</span>
                    <span className="ml-auto">
                      {userBandsCount}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {await getRolePermission("OWNER") && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={lp("/admin/platforms")}>
                      <Podcast />
                      <span>{tc('platforms')}</span>
                      <span className="ml-auto">
                        {platformsCount}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Les statistiques vivent dans le dashboard (par artiste), pas dans l'admin */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={lp("/dashboard")}>
                    <ChartNoAxesColumn />
                    <span>{ta('stats')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={lp("/admin/support")}>
                    <LifeBuoy />
                    <span>{ta('support')}</span>
                    <span className="ml-auto">
                      <SupportBadge />
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <BandStreamSidebarFooter />
    </Sidebar>
  )
}
