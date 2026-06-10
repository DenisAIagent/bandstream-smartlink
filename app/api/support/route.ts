export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth/api-guard";

export async function GET() {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const userId = session!.user!.id!;
  const role = (session!.user as { role?: string }).role;
  const isAdmin = role && ["OWNER", "ADMIN"].includes(role);

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: isAdmin ? {} : { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: {
          select: { id: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const result = tickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      userId: ticket.userId,
      user: ticket.user,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      messageCount: ticket.messages.length,
      lastMessageAt: ticket.messages[0]?.createdAt ?? null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error: authError, session } = await requireAuth();
  if (authError) return authError;

  const userId = session!.user!.id!;

  try {
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        userId,
        messages: {
          create: {
            content: message,
            authorId: userId,
            isAdmin: false,
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
