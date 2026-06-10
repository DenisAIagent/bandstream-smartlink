export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth/api-guard";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const ticketId = parseInt(id, 10);
  const userId = session!.user!.id!;
  const role = (session!.user as { role?: string }).role;
  const isAdmin = role && ["OWNER", "ADMIN"].includes(role);

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Non-admin users can only see their own tickets
    if (!isAdmin && ticket.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark messages as read based on who's viewing.
    // Both blocks can run if an admin views their own ticket.
    if (ticket.userId === userId) {
      // Customer viewing their own ticket — admin replies become read
      await prisma.supportMessage.updateMany({
        where: { ticketId, isAdmin: true, readAt: null },
        data: { readAt: new Date() },
      });
    }
    if (isAdmin) {
      // Admin viewing any ticket — customer messages become read
      await prisma.supportMessage.updateMany({
        where: { ticketId, isAdmin: false, readAt: null },
        data: { readAt: new Date() },
      });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const ticketId = parseInt(id, 10);

  try {
    const { status } = await req.json();

    if (!["OPEN", "IN_PROGRESS", "CLOSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });

    // When closing a ticket, clear all unread markers on it so the badge
    // doesn't keep showing messages from a resolved conversation.
    if (status === "CLOSED") {
      await prisma.supportMessage.updateMany({
        where: { ticketId, readAt: null },
        data: { readAt: new Date() },
      });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
