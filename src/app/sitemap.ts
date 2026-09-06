import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { MetadataRoute } from 'next';

import { BOOTH_GUIDE, GUIDE_LOCALES, guidePath, isGuideLocale } from '@/data/guides';
import { HUB_IDS, HUBS, hubPath } from '@/data/hubs';
import { PRODUCTS, PRODUCT_SLUGS } from '@/data/products';
import { getContentPosts } from '@/lib/content/blog';
import { SEO_LOCALES, defaultLocale } from '@/i18n/config';

import enMessages from '../../messages/en.json';

/**
 * Dynamic sitemap.
 *
 * - Only the indexable locales (SEO_LOCALES) are listed; da/sv/no/is are
 *   noindex until their translations are complete and would only dilute
 *   the crawl budget. Re-enable a locale in src/i18n/config.ts.
 * - Every URL carries hreflang alternates for the same locales + x-default.
 * - Range hubs use their localised slug per locale (src/data/hubs.ts).
 * - Product documents (open PDFs that exist under public/documents) are
 *   listed once; they are not localised.
 * - lastmod is real: the last git commit that touched the page's source
 *   files, falling back to the content's `updatedAt` (products, hubs), the
 *   post date (blog) or the route's `updated` value when git history is not
 *   available at build time (shallow clones).
 * - privacy/terms are noindex and therefore not listed.
 */

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

const SPRINT_DATE = '2026-09-06';

const STATIC_ROUTES: Array<{
  path: string;
  files: string[];
  updated: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}> = [
  { path: '',                changeFrequency: 'weekly',  priority: 1.0, updated: SPRINT_DATE, files: ['src/app/[locale]/page.tsx', 'src/components/sections/Hero.tsx', 'src/components/sections/RWoodShowcase.tsx', 'src/components/sections/ProductsMosaic.tsx'] },
  { path: '/products',       changeFrequency: 'weekly',  priority: 0.9, updated: SPRINT_DATE, files: ['src/app/[locale]/products/page.tsx', 'src/components/sections/ProductsGrid.tsx', 'src/data/products.ts'] },
  { path: '/about',          changeFrequency: 'monthly', priority: 0.7, updated: SPRINT_DATE, files: ['src/app/[locale]/about/page.tsx'] },
  { path: '/sustainability', changeFrequency: 'monthly', priority: 0.7, updated: SPRINT_DATE, files: ['src/app/[locale]/sustainability/page.tsx'] },
  { path: '/where-to-buy',   changeFrequency: 'monthly', priority: 0.7, updated: SPRINT_DATE, files: ['src/app/[locale]/where-to-buy/page.tsx', 'src/components/sections/WhereToBuyPage.tsx'] },
  { path: '/partner',        changeFrequency: 'monthly', priority: 0.7, updated: SPRINT_DATE, files: ['src/app/[locale]/partner/page.tsx'] },
  { path: '/faq',            changeFrequency: 'monthly', priority: 0.6, updated: SPRINT_DATE, files: ['src/app/[locale]/faq/page.tsx'] },
  { path: '/contact',        changeFrequency: 'monthly', priority: 0.6, updated: SPRINT_DATE, files: ['src/app/[locale]/contact/page.tsx'] },
  { path: '/blog',           changeFrequency: 'weekly',  priority: 0.6, updated: SPRINT_DATE, files: ['src/app/[locale]/blog/page.tsx', 'src/components/sections/BlogGrid.tsx'] },
];

// Keep in sync with `generateStaticParams` in `[locale]/blog/[slug]/page.tsx`
const BLOG_SLUGS = [
  'circular-economy-acoustics',
  'office-acoustic-solutions',
  'recycled-materials-quality',
  'sound-absorption-explained',
] as const;

const blogPosts = enMessages.blogPosts as Record<string, { date: string }>;

// ---------------------------------------------------------------------------
// lastmod helpers
// ---------------------------------------------------------------------------

const gitDateCache = new Map<string, string | null>();

/** ISO date of the last commit touching `file`, or null when unknown. */
function gitDate(file: string): string | null {
  const cached = gitDateCache.get(file);
  if (cached !== undefined) return cached;
  let date: string | null = null;
  try {
    date =
      execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() || null;
  } catch {
    date = null;
  }
  gitDateCache.set(file, date);
  return date;
}

/** Newest git date across `files`, else the fallback (both as Date). */
function lastModified(files: string[], fallback: string): Date {
  const dates = files.map(gitDate).filter((d): d is string => d !== null);
  const newest = dates.sort().at(-1);
  return new Date(newest ?? fallback);
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

function alternatesFor(base: string, pathFor: (locale: string) => string) {
  return {
    languages: {
      ...Object.fromEntries(SEO_LOCALES.map((loc) => [loc, `${base}/${loc}${pathFor(loc)}`])),
      // x-default = English (matches src/lib/seo.ts buildLanguageAlternates)
      'x-default': `${base}/${defaultLocale}${pathFor(defaultLocale)}`,
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://re-sound.be').replace(/\/$/, '');
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SEO_LOCALES) {
    // Static routes
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: `${base}/${locale}${route.path}`,
        lastModified: lastModified(route.files, route.updated),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: alternatesFor(base, () => route.path),
      });
    }

    // Range hubs (localised slugs)
    for (const id of HUB_IDS) {
      const hub = HUBS[id];
      entries.push({
        url: `${base}/${locale}${hubPath(hub, locale)}`,
        lastModified: lastModified(
          ['src/data/hubs.ts', 'src/components/hub/RangeHubPage.tsx', `src/app/[locale]${hub.internalPath}/page.tsx`],
          hub.updatedAt
        ),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: alternatesFor(base, (loc) => hubPath(hub, loc)),
      });
    }

    // Booth price guide: exists in GUIDE_LOCALES only, so its hreflang set is
    // restricted to those locales (src/data/guides.ts).
    if (isGuideLocale(locale)) {
      entries.push({
        url: `${base}/${locale}${guidePath(locale)}`,
        lastModified: lastModified(
          ['src/components/guides/BoothPriceGuide.tsx', 'src/app/[locale]/guides/phone-booth-prices/page.tsx', 'content/booth-guide.json'],
          BOOTH_GUIDE.updatedAt
        ),
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: {
            ...Object.fromEntries(GUIDE_LOCALES.map((loc) => [loc, `${base}/${loc}${guidePath(loc)}`])),
            'x-default': `${base}/${defaultLocale}${guidePath(defaultLocale)}`,
          },
        },
      });
    }

    // Product pages
    for (const slug of PRODUCT_SLUGS) {
      const product = PRODUCTS[slug];
      entries.push({
        url: `${base}/${locale}/products/${slug}`,
        lastModified: lastModified(
          [`src/app/[locale]/products/${slug}/page.tsx`, `src/data/specs/${slug}.ts`, 'src/data/products.ts'],
          product.updatedAt
        ),
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: alternatesFor(base, () => `/products/${slug}`),
      });
    }

    // Editorial posts (content/blog/<locale>/*.md): single-locale, so no
    // hreflang alternates; drafts are excluded.
    for (const post of getContentPosts(locale)) {
      entries.push({
        url: `${base}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.dateModified || post.datePublished),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    // Blog posts — lastmod is the post date until posts carry a dateModified
    for (const slug of BLOG_SLUGS) {
      entries.push({
        url: `${base}/${locale}/blog/${slug}`,
        lastModified: new Date(blogPosts[slug]?.date ?? SPRINT_DATE),
        changeFrequency: 'monthly',
        priority: 0.5,
        alternates: alternatesFor(base, () => `/blog/${slug}`),
      });
    }
  }

  // Product documents: open PDFs that actually exist (see docs/missing-documents.md)
  for (const slug of PRODUCT_SLUGS) {
    const product = PRODUCTS[slug];
    for (const doc of product.documents) {
      if (doc.gated) continue;
      const rel = join('public', doc.file);
      if (!existsSync(join(process.cwd(), rel))) continue;
      entries.push({
        url: `${base}${doc.file}`,
        lastModified: lastModified([rel], product.updatedAt),
        changeFrequency: 'yearly',
        priority: 0.3,
      });
    }
  }

  return entries;
}
