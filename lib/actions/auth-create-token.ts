"use server"
import crypto from "crypto"
import prisma from "@/lib/prisma"
import { sendConnectMail } from "@/lib/actions/send-connect-mail"
import { sendSlackUserNotification } from "@/lib/slack/slack"
import { checkRateLimit } from "@/lib/rate-limit"

export async function createToken(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();

  // Rate limit OTP requests: 3 per email per 15 minutes
  if (!checkRateLimit(email, "otp-request")) {
    throw new Error('Too many OTP requests. Please try again later.');
  }

  // Check if the email exists as an existing user OR in the invite table
  // Use case-insensitive search to handle mixed-case emails
  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } }
  });

  if (!existingUser) {
    const invite = await prisma.userInvite.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });

    if (!invite) {
      throw new Error('Email not invited');
    }
  }

  // Generate a random 6-digit code that never starts with 0
  const authCode = (crypto.randomInt(100000, 999999).toString())
  const now = new Date()

  // Try to find existing user or create new one
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      authCode,
      authCodeUpdatedAt: now,
    },
    create: {
      email,
      authCode,
      authCodeUpdatedAt: now,
      role: 'CUSTOMER',
    }
  })

  await sendSlackUserNotification({
    text: `:handshake: ${email} is trying to sign in (${process.env.NODE_ENV})`
  });

  await sendConnectMail(email, user.name || '', authCode)

  return user
}
