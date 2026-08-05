// ============================================================================
// HOST-AWARE SITEMAP — /sitemap.xml
// One Vercel deployment serves 12 domains (one locale each). Each domain must
// expose a sitemap containing ONLY its own URLs, with xhtml:link hreflang
// alternates pointing at the sibling domains (Google's recommended pattern
// for multi-domain international sites). A static app/sitemap.ts can't read
// the Host header, so this is a dynamic route handler instead.
// ============================================================================
import {
  locales,
  defaultLocale,
  localeFullCodes,
  localeForHost,
  originForLocale,
  type Locale,
} from '@/i18n/config';
import { staticRoutes } from '@/lib/site-config';
import { productSlugs } from '@/lib/products';
import { applicationSlugs } from '@/lib/applications';
import { blogSlugs, blogPosts, projectSlugs } from '@/lib/content';
import { techMembranes, techTopicKeys } from '@/lib/technical';

export const dynamic = 'force-dynamic';

function urlFor(locale: Locale, route: string): string {
  return `${originForLocale(locale)}${route === '/' ? '' : route}`;
}

function collectRoutes(): string[] {
  const productRoutes = productSlugs.map((s) => `/products/${s}`);
  const applicationRoutes = applicationSlugs.map((s) => `/applications/${s}`);
  const blogRoutes = blogSlugs.map((s) => `/blog/${s}`);
  const technicalRoutes = Object.keys(techMembranes).flatMap((m) =>
    techTopicKeys.map((t) => `/technical/${m}/${t}`),
  );
  const projectRoutes = projectSlugs.map((s) => `/inspiration/${s}`);
  return [
    ...staticRoutes,
    ...productRoutes,
    ...applicationRoutes,
    ...technicalRoutes,
    ...projectRoutes,
    ...blogRoutes,
  ];
}

function priorityFor(route: string): number {
  if (route === '/') return 1;
  if (route === '/products' || route.startsWith('/products/')) return 0.9;
  if (['/contact', '/partners', '/installer-training'].includes(route)) return 0.8;
  if (route === '/inspiration' || route === '/samples' || route === '/blog') return 0.7;
  if (route.startsWith('/blog/')) return 0.6;
  if (route.startsWith('/technical/')) return 0.6;
  if (route.startsWith('/inspiration/')) return 0.6;
  return 0.4;
}

function changeFreqFor(route: string): string {
  if (route === '/' || route === '/inspiration' || route === '/blog') return 'weekly';
  if (route === '/privacy' || route === '/terms') return 'yearly';
  return 'monthly';
}

function lastModFor(route: string, now: string): string {
  if (route.startsWith('/blog/')) {
    const slug = route.replace('/blog/', '');
    const post = blogPosts.find((p) => p.slug === slug);
    if (post) return `${post.dateModified}T00:00:00.000Z`;
  }
  return now;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function GET(request: Request) {
  const host = request.headers.get('host');
  // Serve the locale owned by this domain; unknown hosts (previews) fall back
  // to the default locale so the sitemap is always valid.
  const locale = localeForHost(host) ?? defaultLocale;
  const now = new Date().toISOString();

  const entries = collectRoutes()
    .map((route) => {
      const alternates = locales
        .map(
          (l) =>
            `    <xhtml:link rel="alternate" hreflang="${localeFullCodes[l] ?? l}" href="${esc(urlFor(l, route))}"/>`,
        )
        .concat(
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(urlFor(defaultLocale, route))}"/>`,
        )
        .join('\n');
      return [
        '  <url>',
        `    <loc>${esc(urlFor(locale, route))}</loc>`,
        `    <lastmod>${lastModFor(route, now)}</lastmod>`,
        `    <changefreq>${changeFreqFor(route)}</changefreq>`,
        `    <priority>${priorityFor(route)}</priority>`,
        alternates,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    entries,
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
