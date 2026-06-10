import { routing } from '@/i18n/routing';

/**
 * Path segments that can never be used as a SmartLink slug on a
 * customer subdomain ({artist}.band.stream/{slug}) : locales gérées
 * par le middleware, routes de preview et chemins applicatifs.
 *
 * Appliqué à la CRÉATION du slug (lib/services/smartlink-create.ts),
 * pas dans le middleware. Le script scripts/migrate-smartlinks.js
 * embarque une copie — garder les deux listes alignées.
 */
export const RESERVED_SLUGS: readonly string[] = [
  ...routing.locales,
  'demo',
  'demo2',
  'demo3',
  'demo4',
  'demo5',
  'api',
  'dashboard',
  'admin',
  'login',
  'legal',
  'privacy',
  'terms',
  'pdb',
  'newsletter',
  'band_test',
  '404',
  'customer',
];
