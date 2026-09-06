import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { fetchGoogleReviews } from '@/lib/google-reviews';

/**
 * Weekly refresh of the Google rating/reviews (vercel.json cron, Mondays
 * 06:00 UTC). Serverless functions cannot write to the repository, so the
 * route re-fetches through the same function as the build script and
 * invalidates the "google-reviews" cache tag used by the Testimonials
 * component; pages re-render with the fresh data on their next request.
 * Protected with CRON_SECRET (Vercel sends it as a Bearer token).
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 });
  }
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: 'GOOGLE_PLACES_API_KEY not set' }, { status: 200 });
  const data = await fetchGoogleReviews(key);
  if (!data) return NextResponse.json({ ok: false, error: 'Places API unavailable' }, { status: 200 });
  revalidateTag('google-reviews');
  return NextResponse.json({ ok: true, rating: data.rating, reviewCount: data.reviewCount, fetchedAt: data.fetchedAt });
}
