"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PeopleAvatar } from "@/components/bandstream/admin/forms/PeopleAvatar"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface PeopleSearchProps {
  onUserSelect?: (user: User) => void
}

export default function PeopleSearch({ onUserSelect }: PeopleSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const tt = useTranslations('teams')

  const handleSearch = async (value: string) => {
    setSearchTerm(value)
    
    if (!value.includes('@') || !value.split('@')[1].includes('.')) {
      setUsers([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/search?email=${encodeURIComponent(value)}`)
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error(tt('failedtosearch')+":", error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    onUserSelect?.(user)
    setSearchTerm("")
    setUsers([])
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">
            {tt('searchusers')}
        </Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder={tt('searchplaceholder')}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">
            {tt('searching')}...
        </p>
      )}

      {users.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleUserSelect(user)}
                  role="button"
                  tabIndex={0}
                >
                  <PeopleAvatar user={user} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {searchTerm.length >= 3 && users.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">
          {tt('nousersfound')} &quot;{searchTerm}&quot;
        </p>
      )}
    </div>
  )
}