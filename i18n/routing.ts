import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  locales: [
    'en', 'fr', 'de', 'es', 'it', 'pt', 'ja',
    'zh', 'ar', 'hi', 'bn', 'ru', 'tr', 'ko',
    'vi', 'id', 'th', 'fa', 'pl', 'nl', 'ur',
    'ms', 'uk', 'ro', 'el', 'is',
  ],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);