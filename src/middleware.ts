import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/config';

// next-intl middleware in DOMAIN mode: the Host header decides the locale
// (stretchplafond.nl → nl, stretchplafond.pl → pl, ...), and each domain
// serves clean, unprefixed URLs. On unknown hosts (localhost, Vercel
// previews) it falls back to path-prefixed routing so every locale remains
// reachable at /be, /fr, /pl, ... for development and QA.
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // CLIENT PORTAL — keep the Supabase auth session fresh on /portal routes.
  // Server Components cannot write cookies, so expired access tokens are
  // refreshed here, the only place where request AND response cookies are
  // both writable. This block no-ops when Supabase is not configured (the
  // portal then runs in demo mode) and on every non-portal route.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey && request.nextUrl.pathname.includes('/portal')) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    // Reading the user triggers a token refresh when needed.
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  // Match all pathnames except: api routes, Next internals, and files with an
  // extension (images, robots.txt override is handled by a route handler).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
