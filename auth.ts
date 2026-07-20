import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { sendSlackUserNotification } from '@/lib/slack/slack';
import { notifyCRM } from '@/lib/crm-events';
import { verifySSOTokenWith, SSO_AUD } from '@/lib/shop-sso';
import Credentials from "next-auth/providers/credentials"
import { checkRateLimit } from "@/lib/rate-limit"
import { resolveLabelMemberships } from "@/lib/services/label-team"
import { hashAuthCode } from "@/lib/auth/otp"

const acceptOnlyInvitedUsers = true;

async function getUserFromDb(email: unknown, authCodeHash: string) {
  if (!email || typeof email !== 'string') return null;

  return await prisma.user.findFirst({
    where: {
      email: { equals: email.trim().toLowerCase(), mode: 'insensitive' },
      authCode: authCodeHash,
      authCodeUpdatedAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      }
    }
  });
}

/**
 * Consomme le code OTP de façon atomique (audit APP-04) : l'UPDATE ne porte
 * que si le code est encore présent — deux requêtes concurrentes avec le
 * même code ne peuvent donc pas aboutir toutes les deux (race condition).
 * Retourne true si la consommation a eu lieu.
 */
async function consumeAuthCode(userId: string, authCodeHash: string): Promise<boolean> {
  const result = await prisma.user.updateMany({
    where: {
      id: userId,
      authCode: authCodeHash,
      authCodeUpdatedAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }
    },
    data: {
      authCode: null,
      authCodeUpdatedAt: null
    }
  });
  return result.count === 1;
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
        // Le code est comparé par empreinte SHA-256 (stockage hashé — APP-04)
        const authCodeHash = hashAuthCode(credentials.authCode)

        // logic to verify if the user exists
        user = await getUserFromDb(credentials.email, authCodeHash)

        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error("Invalid credentials.")
        }

        // Consommation atomique : rejouer le même code en concurrence échoue.
        if (!(await consumeAuthCode(user.id, authCodeHash))) {
          throw new Error("Invalid credentials.")
        }
        // return user object with their profile data
        return user
      },
    }),
    // Accès support depuis le CRM interne : un agent en call clique
    // « Accéder au compte band.stream » sur une fiche client → jeton HMAC
    // court (60 s, secret partagé CRM_SSO_SECRET) → session superadmin ici.
    // Strict : l'agent doit déjà avoir un compte band.stream OWNER/ADMIN
    // (même email que son compte agent CRM).
    Credentials({
      id: 'crm-sso',
      credentials: { token: {} },
      authorize: async (credentials) => {
        const token = credentials?.token;
        const secret = process.env.CRM_SSO_SECRET;
        if (!secret || typeof token !== 'string') {
          throw new Error('CRM SSO not configured');
        }
        const payload = verifySSOTokenWith<{
          type?: string;
          agent_email?: string;
          aud?: string;
          iat?: number;
          exp: number;
        }>(secret, token, { aud: SSO_AUD.appAdminAccess });
        if (!payload || payload.type !== 'crm_admin_access' || !payload.agent_email) {
          throw new Error('Invalid CRM SSO token');
        }
        const user = await prisma.user.findFirst({
          where: {
            email: { equals: payload.agent_email, mode: 'insensitive' },
            role: { in: ['OWNER', 'ADMIN'] },
          },
        });
        if (!user) {
          throw new Error('No matching internal account');
        }
        return user;
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
      // Cible interne explicite (ex. raccourci support du CRM → fiche client
      // 360° /admin/users/:id) : suivie tant qu'elle reste dans l'espace
      // admin de la même origine. Sinon, comportement historique : /admin.
      try {
        const target = new URL(url, baseUrl);
        if (
          target.origin === new URL(baseUrl).origin &&
          /^\/([a-z]{2}\/)?admin(\/|$)/.test(target.pathname)
        ) {
          return target.pathname + target.search;
        }
      } catch {
        // URL invalide → défaut historique
      }
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

      // Fiche client CRM : création à l'inscription (fire-and-forget)
      await notifyCRM({
        type: 'signup',
        email: params.user.email,
        name: params.user.name,
      });

      const rootDomainUrl = process.env.ROOT_DOMAIN_URL || 'https://band.stream';
      const internalApiToken = process.env.INTERNAL_API_TOKEN;
      // Secret en en-tête Bearer (jamais en query string) — audit APP-08.
      await fetch(`${rootDomainUrl}/api/mails/send-welcome-mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(internalApiToken ? { Authorization: `Bearer ${internalApiToken}` } : {}),
        },
        body: JSON.stringify({ username: params.user.name, email: params.user.email }),
      });
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