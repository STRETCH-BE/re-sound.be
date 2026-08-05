// POST /api/portal/sync — admin only. Accepts the Alto Pricing System .xlsx
// (multipart field "file"), parses the client-safe PriceBook columns and syncs
// them into the `pricebook` table. Returns a diff report.
//
// Strategy: UPSERT every parsed row on (category, product, market, seq), then
// delete rows that no longer exist in the workbook — the table is never left
// empty halfway through. Internal Excel columns (margin, cost) are never read.
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/portal/auth';
import { createServiceClient, isSupabaseConfigured } from '@/lib/portal/supabase';
import { parsePricebookWorkbook } from '@/lib/portal/parse-pricebook';
import type { SyncReport } from '@/lib/portal/types';

export const runtime = 'nodejs';

const CHUNK = 500;
const rowKey = (r: { category: string; product: string; market: string; seq: number }) =>
  `${r.category}||${r.product}||${r.market}||${r.seq}`;

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ ok: false, error: 'No file uploaded.' }, { status: 400 });
  }

  let parsed;
  try {
    parsed = parsePricebookWorkbook(await file.arrayBuffer());
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not read the workbook.';
    return NextResponse.json({ ok: false, error: message }, { status: 422 });
  }

  // --- Demo mode: validate + report, nothing persisted ----------------------
  if (!isSupabaseConfigured() || session.demo) {
    const report: SyncReport = {
      total: parsed.rows.length,
      added: parsed.rows.length,
      removed: 0,
      changed: 0,
      unchanged: 0,
      skipped: parsed.skipped,
      version: parsed.version,
      persisted: false,
    };
    return NextResponse.json({ ok: true, report });
  }

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json(
      { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' },
      { status: 500 },
    );
  }

  // Existing state → diff numbers + stale-row detection.
  const { data: existing, error: readError } = await service
    .from('pricebook')
    .select('id, category, product, market, seq, price_eur')
    .limit(20000);
  if (readError) {
    return NextResponse.json({ ok: false, error: readError.message }, { status: 500 });
  }

  const existingByKey = new Map<string, { id: number; price_eur: number }>();
  for (const r of existing ?? []) {
    existingByKey.set(rowKey(r), { id: r.id, price_eur: Number(r.price_eur) });
  }

  let added = 0;
  let changed = 0;
  let unchanged = 0;
  const newKeys = new Set<string>();
  for (const r of parsed.rows) {
    newKeys.add(rowKey(r));
    const prev = existingByKey.get(rowKey(r));
    if (!prev) added += 1;
    else if (Math.abs(prev.price_eur - r.price_eur) >= 0.005) changed += 1;
    else unchanged += 1;
  }
  const staleIds = (existing ?? []).filter((r) => !newKeys.has(rowKey(r))).map((r) => r.id);

  // 1) Upsert all parsed rows (insert new, update existing incl. price/sort).
  for (let i = 0; i < parsed.rows.length; i += CHUNK) {
    const chunk = parsed.rows.slice(i, i + CHUNK).map((r) => ({ ...r, updated_at: new Date().toISOString() }));
    const { error } = await service
      .from('pricebook')
      .upsert(chunk, { onConflict: 'category,product,market,seq' });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // 2) Remove rows that disappeared from the workbook.
  for (let i = 0; i < staleIds.length; i += CHUNK) {
    const { error } = await service
      .from('pricebook')
      .delete()
      .in('id', staleIds.slice(i, i + CHUNK));
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // 3) Update the pricelist metadata (single-row table).
  await service.from('pricebook_meta').upsert({
    id: true,
    version: parsed.version,
    fx_eur_pln: parsed.fxEurPln,
    source: file.name,
    updated_at: new Date().toISOString(),
  });

  const report: SyncReport = {
    total: parsed.rows.length,
    added,
    removed: staleIds.length,
    changed,
    unchanged,
    skipped: parsed.skipped,
    version: parsed.version,
    persisted: true,
  };
  return NextResponse.json({ ok: true, report });
}
