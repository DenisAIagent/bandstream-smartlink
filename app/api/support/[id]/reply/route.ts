export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";
import { sendEmail } from "@/lib/mailers/mailjet";

export async function POST(
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
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Verify the ticket exists and the user has access
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Non-admin users can only reply to their own tickets
    if (!isAdmin && ticket.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.supportMessage.create({
      data: {
        content,
        ticketId,
        authorId: userId,
        isAdmin: !!isAdmin,
      },
    });

    // Update ticket updatedAt
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    // If admin reply, send email notification to ticket owner
    if (isAdmin && ticket.user.email) {
      try {
        await sendEmail({
          name: ticket.user.name || "Customer",
          mail: ticket.user.email,
          sendername: "band.stream Support",
          from: "support@band.stream",
          subject: `Re: ${ticket.subject}`,
          message: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">band.stream Support</h2>
              <p>Hello ${ticket.user.name || "there"},</p>
              <p>You have a new reply on your support ticket: <strong>${ticket.subject}</strong></p>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                ${content}
              </div>
              <p>Log in to your account to view the full conversation and reply.</p>
              <p style="color: #6b7280; font-size: 14px;">— The band.stream team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the reply if email fails
      }
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
