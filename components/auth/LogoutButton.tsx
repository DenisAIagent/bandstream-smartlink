'use client'

import { logout } from "@/components/auth/auth"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  return (
    <Button onClick={() => logout()} className="text-gray-300 hover:text-white">
      Logout
    </Button>
  )
} 