import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';

/**
 * Dynamic sitemap generator.
 *
 * Produces one entry per (locale × route) combination, plus blog posts,
 * with hreflang alternates pointing at every locale of the same route.
 *
 * Replaces the previous static `public/sitemap.xml` (which only covered EN
 * and three products). Adding a locale to `i18n/config.ts` or a route below
 * automatically extends the sitemap.
 */

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '',                              changeFrequency: 'weekly',  priority: 1.0 },
  { path: '/products',                     changeFrequency: 'weekly',  priority: 0.9 },
  { path: '/products/interior',            changeFrequency: 'monthly', priority: 0.8 },
  { path: '/products/solid',               changeFrequency: 'monthly', priority: 0.8 },
  { path: '/products/divide',              changeFrequency: 'monthly', priority: 0.8 },
  { path: '/products/rwood-groove',        changeFrequency: 'monthly', priority: 0.8 },
  { path: '/products/rwood-micro',         changeFrequency: 'monthly', priority: 0.8 },
  { path: '/products/rwood-perf',          changeFrequency: 'monthly', priority: 0.8 },
  { path: '/products/rwood-veneer',        changeFrequency: 'monthly', priority: 0.8 },
  { path: '/products/rpet-panel',          changeFrequency: 'monthly', priority: 0.8 },
  { path: '/products/rpet-groove',         changeFrequency: 'monthly', priority: 0.8 },
  { path: '/products/rpet-flex-groove',    changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about',                        changeFrequency: 'monthly', priority: 0.7 },
  { path: '/sustainability',               changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact',                      changeFrequency: 'monthly', priority: 0.6 },
  { path: '/blog',                         changeFrequency: 'weekly',  priority: 0.6 },
  { path: '/privacy',                      changeFrequency: 'yearly',  priority: 0.3 },
  { path: '/terms',                        changeFrequency: 'yearly',  priority: 0.3 },
];

// Keep in sync with `generateStaticParams` in `[locale]/blog/[slug]/page.tsx`
const BLOG_SLUGS = [
  'circular-economy-acoustics',
  'office-acoustic-solutions',
  'recycled-materials-quality',
  'sound-absorption-explained',
];

function buildLanguageAlternates(base: string, path: string) {
  return {
    ...Object.fromEntries(
      locales.map((loc) => [loc, `${base}/${loc}${path}`])
    ),
    // EN as the default for unspecified locales. Matches the helper in
    // `src/lib/seo.ts` so the static sitemap and per-page alternates stay
    // consistent — Google requires x-default whenever multiple locales
    // exist without a clear regional default.
    'x-default': `${base}/en${path}`,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || 'https://re-sound.be'
  ).replace(/\/$/, '');

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    // Static routes
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: `${base}/${locale}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: buildLanguageAlternates(base, route.path),
        },
      });
    }

    // Blog posts
    for (const slug of BLOG_SLUGS) {
      entries.push({
        url: `${base}/${locale}/blog/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
        alternates: {
          languages: buildLanguageAlternates(base, `/blog/${slug}`),
        },
      });
    }
  }

  return entries;
}
