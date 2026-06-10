// next.config.js
import type { NextConfig } from 'next';
import path from 'path';
import createNextIntlPlugin from 'next-intl/plugin';

const s3PublicUrl = process.env.S3_PUBLIC_URL || process.env.SCALEWAY_ENDPOINT || 'https://placeholder.example.com';

const withNextIntlPlugin = createNextIntlPlugin();

const hostname = new URL(s3PublicUrl).hostname;
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
  // Note : pas de CSP stricte ici car les pages fans/landing utilisent des
  // styles inline et des scripts tiers (GTM/Umami) — à durcir ultérieurement
  // avec une CSP à nonce par requête.
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
        ],
      },
    ];
  },
};

// Export the combined configuration
export default withNextIntlPlugin(nextConfig);