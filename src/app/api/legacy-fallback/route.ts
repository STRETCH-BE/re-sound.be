/**
 * LAYER 4b — the end of the line. next.config's `fallback` rewrite sends every
 * request that matched no public file, no page and no route here (a missing
 * asset, a stray .html, an unknown /api/* path). It answers with a permanent
 * redirect to the visitor's localised home, so this domain never emits an
 * error status for a legacy URL. The original path arrives as ?path= (Next
 * appends the unused source param) or as the x-legacy-path header.
 */
import { NextResponse } from 'next/server';

import { getLocaleFromPath } from '@/i18n/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function redirectHome(request: Request) {
  const url = new URL(request.url);
  const raw = request.headers.get('x-legacy-path') || url.searchParams.get('path') || '/';
  const original = raw.startsWith('/') ? raw : `/${raw}`;
  const locale = getLocaleFromPath(original);
  const res = NextResponse.redirect(new URL(locale ? `/${locale}` : '/', url.origin), 301);
  res.headers.set('x-legacy-fallback', original);
  return res;
}

export function GET(request: Request) {
  return redirectHome(request);
}
export function POST(request: Request) {
  return redirectHome(request);
}
