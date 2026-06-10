"use server"
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { UserInvite } from "@prisma/client";
import { sendSlackUserNotification } from "@/lib/slack/slack";
const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type InviteActionState = {
  error?: string | Record<string, string[]>;
  success?: boolean;
  data?: UserInvite;
};

export async function createInviteAction(
  prevState: InviteActionState,
  formData: FormData
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const currentUserMail = session.user.email;

  const validatedFields = inviteSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const invite = await prisma.userInvite.create({
      data: {
        email: validatedFields.data.email.trim().toLowerCase(),
        invitedById: session.user.id,
      },
    });

    await sendSlackUserNotification({
      text: `:handshake: ${currentUserMail} invited ${validatedFields.data.email} to join the beta (${process.env.NODE_ENV})` 
    });

    return { success: true, data: invite };
  } catch (error) {
    console.error('Error creating invite:', error);
    return { error: "Failed to create invite" };
  }
} 