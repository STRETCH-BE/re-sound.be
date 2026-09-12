import createNextIntlPlugin from 'next-intl/plugin';

import { legacyRedirects } from './redirects.mjs';

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

  // NOTE: no redirect for '/' here. The next-intl middleware
  // (src/middleware.ts) handles the root URL with locale detection.
  //
  // Legacy Wix URLs (redirects.mjs): www → apex, the explicit map and the
  // prefix catch-alls. These run before the filesystem, so they never touch
  // the site's own routes. Unknown page-like paths are handled by the
  // middleware; unknown asset-like paths by the `fallback` rewrite below.
  async redirects() {
    return legacyRedirects;
  },
  async rewrites() {
    return {
      // Checked AFTER public files, pages and dynamic routes, right before the
      // 404 page: whatever still matched nothing (a missing static asset, a
      // stray .html, an unknown /api/* path — the middleware skips those on
      // purpose) is handed to the fallback handler, which 301s to the
      // visitor's localised home. Real files in public/ are served untouched.
      fallback: [{ source: '/:path*', destination: '/api/legacy-fallback' }],
    };
  },

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
