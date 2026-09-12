import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { defaultLocale, getLocaleFromPath, removeLocaleFromPath } from './i18n/config';
import { routing } from './i18n/routing';
import { closestRoute, isKnownRoute, isPublicAssetPath } from './lib/routes';

const intlMiddleware = createMiddleware(routing);

// Anything with a file extension is asset-like: let the filesystem decide. A
// real file in public/ (or a generated one such as /sitemap.xml) is served; a
// missing one reaches the [locale] catch-all / the next.config `fallback`
// rewrite (Layer 4b), which 301 to the localised home instead of a 404.
const ASSET_LIKE = /\.[a-z0-9]{1,8}$/i;

/**
 * LAYER 4 — ZERO-404 FALLBACK (see redirects.mjs for the other layers).
 *
 * next.config redirects (the explicit legacy map and the prefix catch-alls)
 * run before this middleware, so a path arriving here is either one of the
 * site's own routes or something nothing mapped: a mistyped link, a dead
 * backlink, a legacy Wix URL the inventory missed. Those get a 301 to the
 * closest live index (products, guides, blog) or the locale home instead of
 * a 404. A global "/:path*" redirect in next.config would hijack the site's
 * own pages; this is the only place with enough context to tell the two
 * apart. Asset-like paths (a file extension) pass straight through so real
 * files are served; a missing file ends on the localised home via the
 * [locale] catch-all page or the `fallback` rewrite in next.config, which
 * hands unknown /api/* paths to /api/legacy-fallback.
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (ASSET_LIKE.test(pathname)) {
    // An unprefixed file that cannot live in public/ (/wp-login.php,
    // /old-brochure.pdf) would reach the [locale] tree with a bogus locale
    // and error out; send it home now. Files under the public prefixes and
    // locale-prefixed paths go to the filesystem / the [locale] catch-all.
    if (!getLocaleFromPath(pathname) && !isPublicAssetPath(pathname)) {
      const home = new URL('/', request.url);
      home.search = '';
      return NextResponse.redirect(home, 301);
    }
    // Forward the original path so the Layer 4b handler can keep the locale
    // ("/nl/foto.jpg" → "/nl") if the file turns out not to exist.
    const headers = new Headers(request.headers);
    headers.set('x-legacy-path', pathname);
    return NextResponse.next({ request: { headers } });
  }
  const locale = getLocaleFromPath(pathname);
  const route = removeLocaleFromPath(pathname);

  if (!isKnownRoute(route)) {
    const target = closestRoute(route);
    // Unprefixed unknown paths go to "/" so next-intl's locale detection
    // picks the visitor's language on the next hop (two hops, both permanent
    // + the locale redirect; well inside any crawler's limit).
    const url = new URL(locale ? `/${locale}${target === '/' ? '' : target}` : target, request.url);
    url.search = '';
    const res = NextResponse.redirect(url, 301);
    res.headers.set('x-legacy-path', pathname);
    return res;
  }

  return intlMiddleware(request);
}

export const config = {
  // Match everything except API routes and Next internals. Asset-like paths
  // (any file extension) pass straight through above; unknown ones are caught
  // by the [locale] catch-all page or the next.config fallback rewrite, so
  // nothing 404s either way.
  matcher: ['/((?!api/|_next/|_vercel/).*)'],
};

// defaultLocale is referenced so the import is not flagged unused if the
// locale handling above changes; it documents which home an unprefixed
// path ends on after next-intl's detection falls back.
void defaultLocale;
