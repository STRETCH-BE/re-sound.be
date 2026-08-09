import { notFound } from 'next/navigation';

/**
 * Catch-all for unmatched paths inside a locale segment.
 *
 * `not-found.tsx` only renders when `notFound()` is thrown within its
 * segment — without this catch-all, a URL like /en/does-not-exist fell
 * through to Next's default unbranded 404 instead of the localized page.
 */
export default function CatchAllPage() {
  notFound();
}
