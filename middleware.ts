import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './src/i18n/config';

// NOTE: with the `src/` directory in use, Next.js resolves `src/middleware.ts`
// — that file is the source of truth. This root-level copy mirrors it for
// tooling that expects a root middleware; keep the two in sync.
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // CLIENT PORTAL — keep the Supabase auth session fresh on /portal routes.
  // No-ops when Supabase is not configured (demo mode) or off-portal.
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
  // extension (images, robots.txt, sitemap.xml, llms.txt, favicon, etc.).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
