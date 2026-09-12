import { permanentRedirect } from 'next/navigation';

/**
 * Catch-all for unmatched paths inside a locale segment.
 *
 * Page-like unknown paths never get here: src/middleware.ts (Layer 4 of the
 * zero-404 scheme, see redirects.mjs) already 301s them to the closest live
 * index. What does arrive is an asset-like path the middleware let through
 * so the filesystem could try first (/nl/oude-foto.jpg, /en/brochure.pdf):
 * a missing file must not answer 404 on a domain that promises zero dead
 * legacy URLs, so it lands on the locale home with a permanent redirect.
 */
export default function CatchAllPage({ params: { locale } }: { params: { locale: string } }) {
  permanentRedirect(`/${locale}`);
}
