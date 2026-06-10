import { requireAdmin } from "@/lib/auth/api-guard";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
  const { error: authError } = await requireAdmin(); if (authError) return authError;
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get("email")
  const session = await auth()

  if (!email) {
    return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        },
        NOT: {
          email: session?.user?.email
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      },
      take: 5
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Failed to search users:", error)
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
  }
}
