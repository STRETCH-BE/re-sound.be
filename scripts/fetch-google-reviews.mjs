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
//
// Which listing: the one whose Google Maps URL carries the CID the committed
// file already points at (content/google-reviews.json → mapsUrl, the workbook
// value). Text search can return neighbours or namesakes first, so the first
// result is never taken on trust; a name match is the fallback when the CID
// is unknown or absent from the results.
const KNOWN_CID = (() => {
  try {
    const m = /[?&]cid=(\d+)/.exec(JSON.parse(readFileSync(out, 'utf8')).mapsUrl ?? '');
    return m?.[1] ?? null;
  } catch {
    return null;
  }
})();
const SEARCH_QUERIES = [
  'Re-Sound Gentseweg 309 Beveren-Waas',
  'Re-Sound akoestische panelen Beveren',
  'Re-Sound Sint-Niklaas',
  'Re-Sound acoustic panels Belgium',
];

async function fetchReviews() {
  let match = null;
  const seen = [];
  for (const textQuery of SEARCH_QUERIES) {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.googleMapsUri,places.formattedAddress',
      },
      body: JSON.stringify({ textQuery, languageCode: 'nl' }),
    });
    if (!res.ok) {
      console.warn(`[google-reviews] searchText "${textQuery}" answered HTTP ${res.status}`);
      continue;
    }
    const data = await res.json();
    const places = data.places ?? [];
    for (const p of places) seen.push(`${p.displayName?.text ?? '?'} [${p.formattedAddress ?? ''}] ${p.id} ${p.googleMapsUri ?? ''}`);
    const byCid = KNOWN_CID ? places.find((p) => (p.googleMapsUri ?? '').includes(`cid=${KNOWN_CID}`)) : null;
    const byName = places.find((p) => /re-?sound/i.test(p.displayName?.text ?? ''));
    match = byCid ?? byName ?? null;
    if (match) {
      console.log(`[google-reviews] matched ${byCid ? 'by CID' : 'by name'}: "${match.displayName?.text ?? ''}" ${match.id} ${match.googleMapsUri ?? ''}`);
      break;
    }
  }
  if (!match) throw new Error(`listing not found (cid ${KNOWN_CID ?? 'unknown'}); candidates: ${seen.join(' | ') || 'none'}`);
  const placeId = match.id;
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, { headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsUri' } });
  if (!res.ok) throw new Error(`place details ${res.status}`);
  const p = await res.json();
  // A listing without a rating gives the site nothing to show: keep the committed file.
  if (p.rating === undefined || p.rating === null) throw new Error(`no rating on ${placeId} ("${match.displayName?.text ?? ''}")`);
  return {
    placeId, rating: p.rating, reviewCount: p.userRatingCount ?? null, mapsUrl: p.googleMapsUri ?? null,
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
