// lib/global.d.ts
import { PrismaClient } from '@prisma/client';

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;

    interface Window {
        /** Umami tracking client, present once the script has loaded (post-consent) */
        umami?: {
            track: (event: string, data?: Record<string, unknown>) => void;
        };
    }
}

export {};