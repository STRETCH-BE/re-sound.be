import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { GoogleReviewsData } from '@/lib/google-reviews';

/**
 * Testimonials: the workbook's Google reviews (content/testimonials.json)
 * plus, when the Places API could be reached at build or cron time, the
 * live data in content/google-reviews.json. Google data is shown as
 * third-party content ("via Google") and never marked up as Review /
 * AggregateRating. On-site quotes with Consent = Y may carry Review markup
 * later (none yet).
 */
export interface Testimonial {
  author: string;
  rating: number;
  text: string;
  source: 'Google' | 'on-site';
  url: string | null;
  date: string;
  locale: string;
  consent: boolean;
  showOn: string[];
}

export interface TestimonialsData {
  google: { name: string; rating: number | null; reviewCount: number | null; cid: string | null; mapsUrl: string | null; placeId: string | null; writeReviewUrl: string | null; capturedOn: string; source: 'places-api' | 'workbook' };
  reviews: Testimonial[];
}

const CONTENT = join(process.cwd(), 'content');

function readTestimonials(live: GoogleReviewsData | null): TestimonialsData {
  const base = JSON.parse(readFileSync(join(CONTENT, 'testimonials.json'), 'utf8')) as { google: TestimonialsData['google']; reviews: Testimonial[] };
  if (live && live.source === 'places-api' && live.reviews.length > 0) {
    return {
      google: { ...base.google, rating: live.rating, reviewCount: live.reviewCount, mapsUrl: live.mapsUrl ?? base.google.mapsUrl, placeId: live.placeId, writeReviewUrl: live.writeReviewUrl, capturedOn: live.fetchedAt.slice(0, 10), source: 'places-api' },
      reviews: live.reviews.map((r) => ({ author: r.author, rating: r.rating, text: r.text, source: 'Google' as const, url: live.mapsUrl ?? base.google.mapsUrl, date: r.relativeTime, locale: r.language || 'nl', consent: false, showOn: [] })),
    };
  }
  return { google: { ...base.google, writeReviewUrl: base.google.placeId ? `https://search.google.com/local/writereview?placeid=${base.google.placeId}` : null, source: 'workbook' }, reviews: base.reviews };
}

/**
 * Build-time data only. content/google-reviews.json is refreshed by
 * scripts/fetch-google-reviews.mjs in `prebuild` (and committed as the
 * fallback); the weekly cron (src/app/api/cron/google-reviews/route.ts)
 * triggers a redeploy so that script runs again. Nothing in the render path
 * calls the Places API: a Places round-trip at request time was the likeliest
 * cause of the mobile score variance (see docs/lead-sprint-report.md).
 */
let liveCache: GoogleReviewsData | null | undefined;
function loadLive(): GoogleReviewsData | null {
  if (liveCache !== undefined) return liveCache;
  const livePath = join(CONTENT, 'google-reviews.json');
  liveCache = existsSync(livePath) ? (JSON.parse(readFileSync(livePath, 'utf8')) as GoogleReviewsData) : null;
  return liveCache;
}

export async function getTestimonials(): Promise<TestimonialsData> {
  return readTestimonials(loadLive());
}
