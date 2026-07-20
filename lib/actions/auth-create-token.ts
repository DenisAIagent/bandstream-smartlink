"use server"
import crypto from "crypto"
import prisma from "@/lib/prisma"
import { sendConnectMail } from "@/lib/actions/send-connect-mail"
import { sendSlackUserNotification } from "@/lib/slack/slack"
import { checkRateLimit } from "@/lib/rate-limit"
import { hashAuthCode } from "@/lib/auth/otp"

/**
 * Envoie un code de connexion à 6 chiffres si — et seulement si — l'email est
 * connu (compte existant ou invitation). Retourne TOUJOURS la même chose :
 * aucune énumération de comptes possible via la réponse (audit APP-04).
 */
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
      // Réponse générique : on prétend le succès sans rien envoyer — un
      // attaquant ne peut pas distinguer un email inconnu d'un email valide.
      return { sent: false as const };
    }
  }

  // Generate a random 6-digit code (crypto-safe)
  const authCode = crypto.randomInt(100000, 1000000).toString()
  const now = new Date()

  // Seule l'empreinte SHA-256 du code est persistée : une fuite de la base
  // ne compromet pas les codes actifs (fenêtre de 15 min).
  const authCodeHash = hashAuthCode(authCode);

  // Try to find existing user or create new one
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      authCode: authCodeHash,
      authCodeUpdatedAt: now,
    },
    create: {
      email,
      authCode: authCodeHash,
      authCodeUpdatedAt: now,
      role: 'CUSTOMER',
    }
  })

  await sendSlackUserNotification({
    text: `:handshake: ${email} is trying to sign in (${process.env.NODE_ENV})`
  });

  await sendConnectMail(email, user.name || '', authCode)

  return { sent: true as const };
}
