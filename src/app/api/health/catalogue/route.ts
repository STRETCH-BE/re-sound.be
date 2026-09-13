import { NextResponse } from 'next/server';

import { getCatalogue } from '@/lib/catalogue/load';
import { isSupabaseConfigured } from '@/lib/db/supabase';

/**
 * Catalogue health: which source the running instance is on and how much
 * it sees. This is how database connectivity is checked after a deploy:
 * "source": "database" means the Supabase read succeeded within its
 * timeout; "snapshot" means the committed copy is serving, and `configured`
 * says whether that is because the environment variables are missing or
 * because the host did not answer.
 *
 * `currencies` lists the catalogue's currencies with their switch and the
 * locales they apply to (ISK → is, PLN → pl), so "is it on yet" is one call.
 *
 * No prices, no keys, no row content. Never cached: every call reflects the
 * instance's current 60 s catalogue memo.
 */

export const runtime = 'nodejs';
// A GET handler without request input is prerendered at build time by
// default, which would freeze "snapshot" into the response forever.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const catalogue = await getCatalogue();
  const listId = catalogue.products.find((p) => p.priceListId)?.priceListId ?? null;
  const list = (listId ? catalogue.priceLists.find((l) => l.id === listId) : undefined) ?? catalogue.priceLists[0] ?? null;
  return NextResponse.json(
    {
      source: catalogue.source,
      configured: isSupabaseConfigured(),
      products: catalogue.products.length,
      articles: catalogue.articles.length,
      priceList: list ? { id: list.id, validFrom: list.validFrom } : null,
      currencies: catalogue.currencies.map((c) => ({ code: c.code, active: c.active, locales: c.locales })),
      loadedAt: catalogue.loadedAt,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
