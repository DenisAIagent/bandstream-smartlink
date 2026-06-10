import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    // Add any other custom properties your user has
  }

  interface Session {
    user: User & {
      role?: string
      // Add any other custom properties you want in the session
    }
  }
} 