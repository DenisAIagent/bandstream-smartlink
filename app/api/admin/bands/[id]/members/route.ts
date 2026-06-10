import { requireAuth } from "@/lib/auth/api-guard";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id } = await context.params;
  const bandId = parseInt(id);

  try {
    // Verify the caller is a member of this band
    const callerMembership = await prisma.userBand.findUnique({
      where: {
        userId_bandId: {
          userId: session!.user!.id!,
          bandId,
        },
      },
    });

    if (!callerMembership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = await prisma.userBand.findMany({
      where: { bandId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching band members:", error);
    return NextResponse.json(
      { error: "Failed to fetch band members" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id } = await context.params;
  const bandId = parseInt(id);

  try {
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || typeof userId !== "string" || !role || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid userId or role" },
        { status: 400 }
      );
    }

    // Le userId doit correspondre à un utilisateur réel (anti-clé arbitraire)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check caller's role in this band
    const callerMembership = await prisma.userBand.findUnique({
      where: {
        userId_bandId: {
          userId: session!.user!.id!,
          bandId,
        },
      },
    });

    if (!callerMembership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // OWNER can add with any role (ADMIN or MEMBER)
    // ADMIN can only add as MEMBER
    if (callerMembership.role === "MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (callerMembership.role === "ADMIN" && role !== "MEMBER") {
      return NextResponse.json(
        { error: "Admins can only add members" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.userBand.findUnique({
      where: {
        userId_bandId: {
          userId,
          bandId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this band" },
        { status: 409 }
      );
    }

    const member = await prisma.userBand.create({
      data: {
        userId,
        bandId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error adding band member:", error);
    return NextResponse.json(
      { error: "Failed to add band member" },
      { status: 500 }
    );
  }
}
