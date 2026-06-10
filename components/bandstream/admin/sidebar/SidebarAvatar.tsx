"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
export default function SidebarAvatar() {
  const { data: session } = useSession()
  const ta = useTranslations('admin');

  return (
    <div className="flex items-center gap-3 hover:bg-accent rounded-lg p-2 transition-colors">
      <Avatar>
        <AvatarImage src={session?.user?.image ?? undefined} />
        <AvatarFallback>
          {session?.user?.name?.charAt(0) ?? '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-left">
        <span className="text-sm font-medium">
          {session?.user?.name || session?.user?.email || ta('not-signed-in')}
        </span>
        <span className="text-xs text-muted-foreground">
          {session?.user?.email}
        </span>
      </div>
    </div>
  )
}