import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/config';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - ... if they start with `/api`, `/_next` or `/_vercel`
  // - ... the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    '/',
    '/(en|nl|fr|de|es|pt|da|sv|no|is)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
