/**
 * Google Business Profile reviews via the Places API (New).
 *
 * fetchGoogleReviews() is shared by scripts/fetch-google-reviews.mjs (build
 * time, `prebuild`) and the weekly cron route. It never throws on API
 * problems: callers fall back to the committed content/google-reviews.json.
 * The API key (GOOGLE_PLACES_API_KEY) is read from the environment only.
 */

export interface GoogleReview {
  author: string;
  rating: number;
  relativeTime: string;
  text: string;
  language: string;
  publishTime?: string;
}

export interface GoogleReviewsData {
  placeId: string | null;
  rating: number | null;
  reviewCount: number | null;
  mapsUrl: string | null;
  writeReviewUrl: string | null;
  fetchedAt: string;
  reviews: GoogleReview[];
  source: 'places-api' | 'workbook';
}

const SEARCH_QUERIES = ['Re-Sound Gentseweg 309 Beveren-Waas', 'Re-Sound Sint-Niklaas'];

export async function fetchGoogleReviews(apiKey: string): Promise<GoogleReviewsData | null> {
  try {
    let placeId: string | null = null;
    for (const textQuery of SEARCH_QUERIES) {
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'places.id,places.displayName' },
        body: JSON.stringify({ textQuery, languageCode: 'nl' }),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { places?: Array<{ id: string; displayName?: { text?: string } }> };
      const hit = data.places?.find((p) => /re-?sound/i.test(p.displayName?.text ?? '')) ?? data.places?.[0];
      if (hit?.id) { placeId = hit.id; break; }
    }
    if (!placeId) return null;
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsUri' },
    });
    if (!res.ok) return null;
    const p = (await res.json()) as {
      rating?: number; userRatingCount?: number; googleMapsUri?: string;
      reviews?: Array<{ rating?: number; relativePublishTimeDescription?: string; publishTime?: string; text?: { text?: string; languageCode?: string }; originalText?: { text?: string; languageCode?: string }; authorAttribution?: { displayName?: string } }>;
    };
    return {
      placeId,
      rating: p.rating ?? null,
      reviewCount: p.userRatingCount ?? null,
      mapsUrl: p.googleMapsUri ?? null,
      writeReviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
      fetchedAt: new Date().toISOString(),
      source: 'places-api',
      reviews: (p.reviews ?? []).slice(0, 5).map((r) => ({
        author: r.authorAttribution?.displayName ?? '',
        rating: r.rating ?? 0,
        relativeTime: r.relativePublishTimeDescription ?? '',
        text: r.originalText?.text ?? r.text?.text ?? '',
        language: r.originalText?.languageCode ?? r.text?.languageCode ?? '',
        publishTime: r.publishTime,
      })),
    };
  } catch {
    return null;
  }
}
