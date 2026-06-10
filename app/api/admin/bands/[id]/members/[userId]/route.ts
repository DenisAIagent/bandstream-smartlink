import { requireAuth } from "@/lib/auth/api-guard";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id, userId } = await context.params;
  const bandId = parseInt(id);

  try {
    const body = await req.json();
    const { role } = body;

    if (!role || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Only OWNER can change roles
    const callerMembership = await prisma.userBand.findUnique({
      where: {
        userId_bandId: {
          userId: session!.user!.id!,
          bandId,
        },
      },
    });

    if (!callerMembership || callerMembership.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cannot change the owner's role
    const targetMembership = await prisma.userBand.findUnique({
      where: {
        userId_bandId: {
          userId,
          bandId,
        },
      },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (targetMembership.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot change owner's role" },
        { status: 403 }
      );
    }

    const updated = await prisma.userBand.update({
      where: {
        userId_bandId: {
          userId,
          bandId,
        },
      },
      data: { role },
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id, userId } = await context.params;
  const bandId = parseInt(id);

  try {
    // Only OWNER can remove members
    const callerMembership = await prisma.userBand.findUnique({
      where: {
        userId_bandId: {
          userId: session!.user!.id!,
          bandId,
        },
      },
    });

    if (!callerMembership || callerMembership.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cannot remove the owner
    const targetMembership = await prisma.userBand.findUnique({
      where: {
        userId_bandId: {
          userId,
          bandId,
        },
      },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (targetMembership.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot remove the owner" },
        { status: 403 }
      );
    }

    await prisma.userBand.delete({
      where: {
        userId_bandId: {
          userId,
          bandId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing band member:", error);
    return NextResponse.json(
      { error: "Failed to remove band member" },
      { status: 500 }
    );
  }
}
