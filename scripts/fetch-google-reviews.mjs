#!/usr/bin/env node
/**
 * Refreshes content/google-reviews.json from the Google Places API (New).
 * Runs at build time (`prebuild`). Without GOOGLE_PLACES_API_KEY, or when the
 * API fails, the committed file is left untouched and the site falls back to
 * the workbook reviews in content/testimonials.json.
 *
 * Never commit the key: it comes from the environment (Vercel project env).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const out = resolve(root, 'content/google-reviews.json');
const key = process.env.GOOGLE_PLACES_API_KEY;

if (!key) {
  console.log('[google-reviews] GOOGLE_PLACES_API_KEY not set — keeping the committed content/google-reviews.json');
  process.exit(0);
}

// The TypeScript module is not importable here at build time, so the same
// two calls are repeated in plain JS (kept in sync with src/lib/google-reviews.ts).
async function fetchReviews() {
  let placeId = null;
  for (const textQuery of ['Re-Sound Gentseweg 309 Beveren-Waas', 'Re-Sound Sint-Niklaas']) {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.id,places.displayName' },
      body: JSON.stringify({ textQuery, languageCode: 'nl' }),
    });
    if (!res.ok) continue;
    const data = await res.json();
    const hit = data.places?.find((p) => /re-?sound/i.test(p.displayName?.text ?? '')) ?? data.places?.[0];
    if (hit?.id) { placeId = hit.id; break; }
  }
  if (!placeId) throw new Error('place not found');
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, { headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsUri' } });
  if (!res.ok) throw new Error(`place details ${res.status}`);
  const p = await res.json();
  return {
    placeId, rating: p.rating ?? null, reviewCount: p.userRatingCount ?? null, mapsUrl: p.googleMapsUri ?? null,
    writeReviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`, fetchedAt: new Date().toISOString(), source: 'places-api',
    reviews: (p.reviews ?? []).slice(0, 5).map((r) => ({ author: r.authorAttribution?.displayName ?? '', rating: r.rating ?? 0, relativeTime: r.relativePublishTimeDescription ?? '', text: r.originalText?.text ?? r.text?.text ?? '', language: r.originalText?.languageCode ?? r.text?.languageCode ?? '', publishTime: r.publishTime })),
  };
}

try {
  const data = await fetchReviews();
  writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
  console.log(`[google-reviews] ${data.reviewCount} reviews, rating ${data.rating} — written to content/google-reviews.json`);
} catch (err) {
  const previous = JSON.parse(readFileSync(out, 'utf8'));
  console.warn(`[google-reviews] API failed (${err.message}) — keeping the committed file from ${previous.fetchedAt}`);
}
