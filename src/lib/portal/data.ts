// ============================================================================
// CLIENT PORTAL — pricebook data access
//
// Supabase mode: rows come from the `pricebook` table through the USER's own
// session, so Postgres row-level security enforces market visibility even if
// application code had a bug. Demo mode: rows come from the bundled sample
// JSON and are filtered in code. Both paths return the same shape.
// ============================================================================
import type { PortalSession, PricebookMeta, PriceRow } from './types';
import { categoryRank } from './types';
import { createRscClient, isSupabaseConfigured } from './supabase';

type Pricebook = { rows: PriceRow[]; meta: PricebookMeta };

function sortRows(rows: PriceRow[]): PriceRow[] {
  return rows
    .slice()
    .sort((a, b) => categoryRank(a.category) - categoryRank(b.category) || a.sort - b.sort);
}

function visibleToProfile(row: PriceRow, session: PortalSession): boolean {
  if (session.profile.allMarkets) return true;
  return session.profile.markets.includes(row.market);
}

async function demoPricebook(session: PortalSession): Promise<Pricebook> {
  // Dynamic import keeps the (large) sample JSON out of every other page's
  // module graph; it only ever loads server-side.
  const demo = (await import('./demo-pricebook.json')).default as {
    meta: PricebookMeta;
    rows: PriceRow[];
  };
  return {
    meta: demo.meta,
    rows: sortRows(demo.rows.filter((r) => visibleToProfile(r, session))),
  };
}

/** All pricebook rows the signed-in account is allowed to see, plus metadata. */
export async function getPricebook(session: PortalSession): Promise<Pricebook> {
  if (!isSupabaseConfigured() || session.demo) return demoPricebook(session);

  const supabase = createRscClient();
  const [{ data: rows, error }, { data: meta }] = await Promise.all([
    supabase
      .from('pricebook')
      .select('category, code, product, unit, market, price_eur, price_pln, product_group, seq, sort')
      .order('sort', { ascending: true })
      .limit(10000),
    supabase.from('pricebook_meta').select('version, fx_eur_pln, source, updated_at').maybeSingle(),
  ]);
  if (error) throw new Error(`pricebook query failed: ${error.message}`);

  return {
    rows: sortRows((rows ?? []) as PriceRow[]),
    meta: {
      version: meta?.version ?? '—',
      fx_eur_pln: meta?.fx_eur_pln ?? null,
      source: meta?.source ?? null,
      updated_at: meta?.updated_at ?? '',
    },
  };
}
