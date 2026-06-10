import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface PeopleAvatarProps {
  user: {
    name: string | null
    email: string
    image: string | null
  }
  showDetails?: boolean
}

export function PeopleAvatar({ user, showDetails = true }: PeopleAvatarProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={user.image ?? undefined} />
        <AvatarFallback>
          {user.name?.charAt(0) ?? user.email.charAt(0)}
        </AvatarFallback>
      </Avatar>
      {showDetails && (
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">
            {user.name || "No name"}
          </p>
          <p className="text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>
      )}
    </div>
  )
} 