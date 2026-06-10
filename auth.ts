import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { sendSlackUserNotification } from '@/lib/slack/slack';
import Credentials from "next-auth/providers/credentials"
import { checkRateLimit } from "@/lib/rate-limit"
import { resolveLabelMemberships } from "@/lib/services/label-team"

const acceptOnlyInvitedUsers = true;

async function getUserFromDb(email: unknown, authCode: string) {
  if (!email || typeof email !== 'string') return null;

  return await prisma.user.findFirst({
    where: {
      email: { equals: email.trim().toLowerCase(), mode: 'insensitive' },
      authCode: authCode,
      authCodeUpdatedAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      }
    }
  });
}

async function clearAuthCode(email: string) {
  if (!email) return null;

  const user = await prisma.user.findFirst({
    where: { email: { equals: email.trim().toLowerCase(), mode: 'insensitive' } }
  });
  if (!user) return null;

  return await prisma.user.update({
    where: { id: user.id },
    data: {
      authCode: null,
      authCodeUpdatedAt: null
    }
  });
}


const { auth: realAuth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        authCode: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.authCode || typeof credentials.authCode !== 'string') {
          throw new Error("Invalid auth code");
        }

        // Rate limit verification attempts: 5 per email per 15 minutes
        const email = typeof credentials.email === 'string' ? credentials.email : '';
        if (!checkRateLimit(email, "otp-verify")) {
          throw new Error("Too many verification attempts. Please try again later.");
        }

        let user = null
        const authCode = credentials.authCode

        // logic to verify if the user exists
        user = await getUserFromDb(credentials.email, authCode)
 
        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error("Invalid credentials.")
        }
 
        await clearAuthCode(credentials.email as string)
        // return user object with their profile data
        return user
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await sendSlackUserNotification({
        text: `:information_desk_person: ${user.email} is trying to sign in (${process.env.NODE_ENV})` 
      });

      // We check if the user already exists, in that case we allow the sign in
      const existingUser = await prisma.user.findFirst({
        where: {
          email: { equals: user.email ?? '', mode: 'insensitive' }
        }
      });

      // The user exists, we allow the sign in
      if (existingUser) {
        await sendSlackUserNotification({
            text: `:white_check_mark: ${user.email} is an existing user, signing in... (${process.env.NODE_ENV})`
          });
          // Rattache les invitations d'équipe label en attente pour cet email
          if (existingUser.email) {
            await resolveLabelMemberships(existingUser.id, existingUser.email).catch((e) =>
              console.error('resolveLabelMemberships failed:', e)
            );
          }
          return true;
      }else{
      }

      if (!acceptOnlyInvitedUsers) {
        return true;
      }

      // If not, we check if the user has been invited, in that case we allow the sign in
      const invite = await prisma.userInvite.findFirst({
        where: {
          email: { equals: user.email ?? '', mode: 'insensitive' }
        }
      });
      
      if (invite?.email == user.email) {
        await sendSlackUserNotification({ 
            text: `:white_check_mark: ${user.email} has been invited, creating account... (${process.env.NODE_ENV})` 
          });
        return true;
      } else {
        return '/';
        // return true;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token.sub) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return "/admin"
    }
  },
  events: {
    async createUser(message) {
      // Nouvel inscrit invité par un label : rattacher et donner l'accès roster
      if (message.user.id && message.user.email) {
        await resolveLabelMemberships(message.user.id, message.user.email).catch((e) =>
          console.error('resolveLabelMemberships failed:', e)
        );
      }
      const params = {
        user: {
          name: message.user.name,
          email: message.user.email,
        },
      };

      if(!params.user.name || !params.user.email) {
        return;
      }

      await sendSlackUserNotification({ 
        text: `:white_check_mark: New account created: ${message.user.name} (${message.user.email}) (${process.env.NODE_ENV})` 
      });

      const rootDomainUrl = process.env.ROOT_DOMAIN_URL || 'https://band.stream';
      const internalApiToken = process.env.INTERNAL_API_TOKEN;
      await fetch(`${rootDomainUrl}/api/mails/send-welcome-mail?internalApiToken=${internalApiToken}&username=${params.user.name}&email=${params.user.email}`);
    }
  },

  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/error',
  }
})

// Preview locale sans login : activé uniquement par PREVIEW_NO_AUTH=1 ET hors
// production. Le double verrou NODE_ENV !== 'production' garantit que le bypass
// est physiquement impossible en prod, même si la variable fuit dans l'env.
// Le bypass de preview est PHYSIQUEMENT désactivé en production par la
// condition NODE_ENV !== 'production' : même si la variable fuit dans
// l'env de prod, `auth` reste `realAuth` (aucun bypass possible).
const PREVIEW_NO_AUTH =
  process.env.PREVIEW_NO_AUTH === '1' && process.env.NODE_ENV !== 'production';

if (process.env.PREVIEW_NO_AUTH === '1' && process.env.NODE_ENV === 'production') {
  // Alerte bruyante (sans bloquer le build) : le flag est présent en prod
  // mais le bypass est neutralisé — à retirer de l'env immédiatement.
  console.error(
    'SECURITY WARNING: PREVIEW_NO_AUTH=1 detected in production — the auth bypass is FORCE-DISABLED, but remove this variable from the production environment now.'
  );
}

const PREVIEW_SESSION = {
  user: {
    id: 'preview-user',
    email: 'preview@local.test',
    name: 'Denis (Preview)',
    role: 'OWNER',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

const auth = (PREVIEW_NO_AUTH
  ? (async (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = await (realAuth as any)(...args);
      if (session?.user) return session;
      return PREVIEW_SESSION;
    })
  : realAuth) as typeof realAuth;

export { auth, handlers, signIn, signOut }