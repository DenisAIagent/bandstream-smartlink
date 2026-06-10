// app/admin/layout.tsx
import "@/app/globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/bandstream/theme-provider"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger, } from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/bandstream/admin/sidebar/Sidebar"
import AdminBreadcrumbs from "@/components/bandstream/admin/Breadcrumbs"
// import ConsentManager from "@/components/privacy/ConsentManager"
import { metadata } from "@/app/[locale]/admin/metadata"
import { getTranslations } from "next-intl/server"
export { metadata }

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode,
  params: { slug: string[] }
}) {
  const ta = await getTranslations("admin");
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-svh">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <Home className="h-4 w-4 mr-2" />
              {ta("home")}
            </Link>
          </Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <AdminBreadcrumbs />
        </header>

        <div className="flex-1">
          {children}
        </div>
      </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}