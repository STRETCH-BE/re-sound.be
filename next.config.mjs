import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization: AVIF first (~30% smaller than WebP at equivalent
  // quality), WebP fallback, optimised variants cached at the edge for a year.
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },

  reactStrictMode: true,

  poweredByHeader: false,

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://re-sound.be',
  },

  // NOTE: no redirects() for '/' here. The next-intl middleware
  // (src/middleware.ts) handles the root URL with locale detection. The old
  // config-level '/' → '/en' redirect existed only because middleware.ts sat
  // at the repo root while the app lives in src/ — a location Next.js
  // ignores — so the middleware never ran at all.

  async headers() {
    return [
      {
        // Static marketing assets. Not immutable: files keep stable names
        // when re-exported, so allow revalidation after a month.
        source: '/:prefix(images|documents|videos)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/:file(favicon.ico|apple-touch-icon.png|icon-192.png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
