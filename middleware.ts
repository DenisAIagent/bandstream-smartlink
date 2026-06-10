import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import authConfig from "./auth.config"
import NextAuth from "next-auth"
import createMiddleware from "next-intl/middleware";
import {routing} from '@/i18n/routing';

const { auth } = NextAuth(authConfig)
const intlMiddleware = createMiddleware({
    locales: routing.locales,
    defaultLocale: routing.defaultLocale
});

import { RESERVED_SUBDOMAINS } from '@/lib/middleware-utils/reserved-subdomains';

// Domain configuration from environment
const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'band.stream';

/**
 * Extract customer name from hostname.
 *
 * Examples:
 *   jiro.band.stream        → "jiro"
 *   jiro.dev.band.stream    → "jiro"
 *   band.stream             → null (root domain)
 *   internal.band.stream    → null (internal tools)
 *   analytics.internal.band.stream → null (internal tools)
 */
function extractCustomer(hostname: string): string | null {
    // Remove port if present
    const host = hostname.split(':')[0];

    // Must contain our root domain
    if (!host.endsWith(ROOT_DOMAIN)) {
        return null;
    }

    // Get the prefix before the root domain
    const prefix = host.slice(0, -(ROOT_DOMAIN.length + 1)); // +1 for the dot

    if (!prefix) {
        // Root domain (band.stream) — no customer
        return null;
    }

    // Skip reserved subdomains (internal, dev, cloud, staging, etc.)
    const firstLevel = prefix.split('.')[0];
    if (RESERVED_SUBDOMAINS.includes(firstLevel)) {
        return null;
    }

    // Handle dev subdomain (customer.dev.band.stream)
    if (prefix.endsWith('.dev')) {
        const customer = prefix.slice(0, -4); // remove ".dev"
        return customer || null;
    }

    // Direct subdomain (customer.band.stream)
    // Only if there's exactly one level (no dots in prefix)
    if (!prefix.includes('.')) {
        return prefix;
    }

    return null;
}

const PREVIEW_NO_AUTH =
    process.env.PREVIEW_NO_AUTH === '1' && process.env.NODE_ENV !== 'production';

export default async function middleware(req: NextRequest) {
    try {
        const hostname = req.headers.get('host') || '';
        const pathname = req.nextUrl.pathname;

        // Handle auth
        let authResponse = null;
        try {
            authResponse = await auth();
        } catch (authError) {
            console.error(`Auth error in middleware: ${authError}`);
        }

        // Backstop d'authentification sur l'API protégée : filet de sécurité
        // si une route oubliait son requireAuth/requireAdmin. Renvoie un 401
        // JSON (pas une redirection HTML) et n'exécute pas la logique i18n/customer.
        if (
            (pathname.startsWith('/api/admin') || pathname.startsWith('/api/dashboard')) &&
            !PREVIEW_NO_AUTH
        ) {
            if (!authResponse?.user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.next();
        }

        // Protect admin and dashboard pages
        // (PREVIEW_NO_AUTH désactive la garde pour la preview locale — inerte en production)
        if (!authResponse?.user && !PREVIEW_NO_AUTH) {
            if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
                return NextResponse.redirect(new URL('/login', req.url));
            }
        }

        // Test path for previewing artist pages without subdomain
        // /band_test/{customer} → hub ; /band_test/{customer}/{slug} → smartlink
        if (pathname.startsWith('/band_test/')) {
            const segments = pathname.split('/band_test/')[1]?.split('/').filter(Boolean) ?? [];
            if (segments.length === 1) {
                return NextResponse.rewrite(new URL(`/customer/fr/${segments[0]}`, req.url));
            }
            if (segments.length === 2) {
                return NextResponse.rewrite(new URL(`/customer/fr/${segments[0]}/${segments[1]}`, req.url));
            }
        }

        // SmartLink template preview routes (#42) — locale-free, must bypass
        // intlMiddleware which would otherwise redirect /demo → /fr/demo (404).
        if (/^\/demo[1-9]?$/.test(pathname)) {
            return NextResponse.next();
        }

        // Landing pages /ads and /pdb are now Next.js pages under [locale],
        // so intlMiddleware handles the /pdb → /fr/pdb redirect naturally.
        // No bypass needed.

        // Skip reserved subdomains — pass through to i18n
        const hostPrefix = hostname.split(':')[0].replace(`.${ROOT_DOMAIN}`, '').split('.')[0];
        if (RESERVED_SUBDOMAINS.includes(hostPrefix)) {
            return intlMiddleware(req);
        }

        // Customer detection — sur un sous-domaine client, on accepte :
        //   /                    → hub artiste
        //   /{locale}            → hub artiste (locale explicite)
        //   /{slug}              → smartlink d'une sortie
        //   /{locale}/{slug}     → smartlink (locale explicite)
        // Au-delà de 2 segments → intlMiddleware (404).
        const supportedLocalesList = routing.locales as readonly string[];
        const segments = pathname.split('/').filter(Boolean);
        let slug: string | null = null;
        let isCustomerPath = false;

        if (segments.length === 0) {
            isCustomerPath = true;
        } else if (segments.length === 1) {
            isCustomerPath = true;
            if (!supportedLocalesList.includes(segments[0])) {
                slug = segments[0];
            }
        } else if (segments.length === 2 && supportedLocalesList.includes(segments[0])) {
            isCustomerPath = true;
            slug = segments[1];
        }

        const customer = isCustomerPath ? extractCustomer(hostname) : null;

        if (customer) {
            try {
                // Use the root domain for the API call (subdomains can't serve their own API).
                // Schéma forcé en https (jamais dérivé d'un header client → anti-SSRF),
                // customer encodé pour neutraliser toute injection dans l'URL.
                const fetchURL = `https://${ROOT_DOMAIN}`;
                const response = await fetch(
                    `${fetchURL}/api/check-customer?customer=${encodeURIComponent(customer)}`
                );
                const data = await response.json();

                if (data.exists) {
                    // Detect locale from path or Accept-Language header, fallback to defaultLocale
                    const pathLocale = pathname.split('/')[1];
                    const supportedLocales = routing.locales as readonly string[];
                    let locale: string;
                    if (pathLocale && supportedLocales.includes(pathLocale)) {
                        locale = pathLocale;
                    } else {
                        const acceptLang = req.headers.get('accept-language') || '';
                        const preferredLocale = acceptLang
                            .split(',')
                            .map(part => part.split(';')[0].trim().split('-')[0])
                            .find(lang => supportedLocales.includes(lang));
                        locale = preferredLocale || routing.defaultLocale;
                    }
                    const target = slug
                        ? `/customer/${locale}/${customer}/${slug}`
                        : `/customer/${locale}/${customer}`;
                    return NextResponse.rewrite(new URL(target, req.url));
                } else {
                    return NextResponse.redirect(new URL('/404', req.url));
                }
            } catch (error) {
                console.error(`Failed to check customer "${customer}": ${error}`);
                return NextResponse.redirect(new URL('/', req.url));
            }
        }

        // Handle i18n
        return intlMiddleware(req);
    } catch (error) {
        console.error(`Middleware error: ${error}`);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-icon|svg|fonts|images).*)",
        "/(fr|en|de|es|it|pt|ja|zh|ar|hi|bn|ru|tr|ko|vi|id|th|fa|pl|nl|ur|ms|uk|ro|el|is)/admin/:path*",
        "/(fr|en|de|es|it|pt|ja|zh|ar|hi|bn|ru|tr|ko|vi|id|th|fa|pl|nl|ur|ms|uk|ro|el|is)/dashboard/:path*",
        "/",
        "/(fr|en|de|es|it|pt|ja|zh|ar|hi|bn|ru|tr|ko|vi|id|th|fa|pl|nl|ur|ms|uk|ro|el|is)/:path*"
    ],
}
