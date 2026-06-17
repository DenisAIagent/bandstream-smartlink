// next.config.js
import type { NextConfig } from 'next';
import path from 'path';
import createNextIntlPlugin from 'next-intl/plugin';

const s3PublicUrl = process.env.S3_PUBLIC_URL || process.env.SCALEWAY_ENDPOINT || 'https://placeholder.example.com';

const withNextIntlPlugin = createNextIntlPlugin();

const hostname = new URL(s3PublicUrl).hostname;

// --- Content-Security-Policy (défense en profondeur) ---------------------
// Par défaut en mode Report-Only : la politique n'est JAMAIS bloquante, les
// violations sont seulement remontées (console navigateur / report-uri). On
// passe CSP_ENFORCE=true en prod une fois la politique validée en staging.
const safeOrigin = (value: string | undefined): string => {
  try {
    return value ? new URL(value).origin : '';
  } catch {
    return '';
  }
};
const s3Origin = safeOrigin(s3PublicUrl);
const umamiOrigin = safeOrigin(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL);
const googleAnalytics = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
];

const cspDirectives = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'self'`,
  `form-action 'self'`,
  // 'unsafe-inline' reste requis tant que GTM/Umami injectent des scripts
  // inline. Étape suivante du durcissement : CSP à nonce par requête.
  [`script-src 'self' 'unsafe-inline'`, ...googleAnalytics, umamiOrigin].filter(Boolean).join(' '),
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  [`connect-src 'self'`, ...googleAnalytics, umamiOrigin, s3Origin].filter(Boolean).join(' '),
  `frame-src 'self' https://*.stripe.com`,
  `upgrade-insecure-requests`,
].join('; ');

const cspHeaderKey =
  process.env.CSP_ENFORCE === 'true'
    ? 'Content-Security-Policy'
    : 'Content-Security-Policy-Report-Only';

// Replace domains array with remotePatterns configuration
const remotePatterns = [
  {
    protocol: 'https' as const,
    hostname: hostname,
    pathname: '**',
  },
  {
    protocol: 'https' as const,
    hostname: 'lh3.googleusercontent.com',
    pathname: '**',
  },
  {
    protocol: 'https' as const,
    hostname: 'avatars.githubusercontent.com',
    pathname: '**',
  },
  {
    protocol: 'https' as const,
    hostname: 'band.stream',
    pathname: '**',
  },
];

// Combine all configurations into a single object
const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  generateBuildId: async () => {
    // You can use any of these approaches:
    // 1. Return a git commit hash
    // return execSync('git rev-parse HEAD').toString().trim();
    // 2. Use an environment variable
    return process.env.BUILD_ID || 'development';
    // 3. Or just return a fixed string if you want
    // return 'your-fixed-build-id';
  },
  experimental: {
    // dynamicIO: true,
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  // Static landing pages served from public/ with clean URLs
  async rewrites() {
    return [];
  },
  // En-têtes de sécurité globaux (défense en profondeur).
  // La CSP est servie en Report-Only par défaut (voir cspHeaderKey) afin de
  // ne rien casser ; on la bascule en mode bloquant via CSP_ENFORCE=true une
  // fois validée, puis on retire 'unsafe-inline' avec une CSP à nonce.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          { key: cspHeaderKey, value: cspDirectives },
        ],
      },
    ];
  },
};

// Export the combined configuration
export default withNextIntlPlugin(nextConfig);