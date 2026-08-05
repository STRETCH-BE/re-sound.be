import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  // Previously had `unoptimized: true` which disabled ALL of next/image's
  // benefits across the site even though every component uses <Image>.
  // With it removed, Vercel's Image Optimization API now:
  //   - serves AVIF / WebP based on Accept header (50-80% smaller than JPEG/PNG)
  //   - resizes per device viewport (no more shipping 1920px hero to phones)
  //   - lazy-loads off-screen images (deferred via the loading=lazy default)
  //   - caches optimised variants at the edge for 1 year
  // Source images >5 MB will still work but the cold-cache first-request will
  // be slower than ideal — see the re-encode script for the worst offenders.
  images: {
    // AVIF first (~30% smaller than WebP at equivalent quality), WebP fallback
    formats: ['image/avif', 'image/webp'],
    // Cache optimised variants at the edge for a year
    minimumCacheTTL: 31536000,
    // Default deviceSizes and imageSizes cover this site's responsive needs
  },

  // Strict mode for better development
  reactStrictMode: true,

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://re-sound.be',
  },

  // Platform-level redirect for the bare root URL.
  //
  // The next-intl middleware should redirect '/' to '/en' on its own, but
  // on this deployment it isn't (likely a Vercel platform-routing quirk
  // on the `new.re-sound.be` subdomain). Adding the redirect here makes
  // Vercel handle it at the edge before any application code runs —
  // guaranteed to work regardless of middleware state.
  //
  // Once the site lives at `re-sound.be` proper, you can leave this in
  // place: a hard root → /en redirect is the right behaviour for the
  // 10-locale setup either way.
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
