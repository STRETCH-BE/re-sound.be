#!/usr/bin/env node
/**
 * Refreshes src/data/catalogue.snapshot.json from the database.
 *
 *   npm run catalogue:snapshot        (also runs in "prebuild")
 *
 * The site reads the catalogue from Supabase at request time and falls back
 * to this JSON when the database is unreachable or not configured
 * (src/lib/catalogue/load.ts). Running this before every build keeps the
 * fallback current — including the translated `labels` columns, which the
 * workbook importer (price-list-to-sql.mjs) cannot know.
 *
 * Reads ONLY the four public tables (price_lists, products, categories,
 * articles), with the columns listed below. supplier_articles, orders and
 * order_lines are never touched: the file is committed to a public repository.
 *
 * Never fails the build: when the environment variables are missing, the host
 * does not answer or the database returns an empty catalogue, it prints a
 * warning, keeps the committed file and exits 0.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SNAPSHOT_PATH = join(REPO_ROOT, 'src', 'data', 'catalogue.snapshot.json');
const SNAPSHOT_REL = relative(REPO_ROOT, SNAPSHOT_PATH);
/** Build time is less hurried than a page render (4 s there): allow a slow cold start. */
const TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Environment — npm scripts do not load .env.local, so read it here. Real
// environment variables (Vercel) always win over the file.
// ---------------------------------------------------------------------------
function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const name = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!(name in process.env)) process.env[name] = value;
  }
}
loadEnvFile(join(REPO_ROOT, '.env.local'));
loadEnvFile(join(REPO_ROOT, '.env'));

function keep(reason) {
  console.warn(`[catalogue-snapshot] ${reason} — keeping the committed ${SNAPSHOT_REL}`);
  process.exit(0);
}

// SUPABASE_URL / SUPABASE_ANON_KEY, with the older NEXT_PUBLIC_ names as a fallback (src/lib/db/supabase.ts).
const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (!url || !key) keep('SUPABASE_URL / SUPABASE_ANON_KEY not set');

// ---------------------------------------------------------------------------
// Client with a hard timeout — the sandbox that builds the site may not be
// able to reach the host at all.
// ---------------------------------------------------------------------------
const fetchWithTimeout = (input, init) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`no answer within ${TIMEOUT_MS} ms`)), TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
};
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: fetchWithTimeout },
});

// Column lists: explicit, so a column added to a table later never leaks into
// the public file by accident. Mirrors src/lib/catalogue/load.ts.
const COLUMNS = {
  price_lists: 'id, name, currency, valid_from, price_basis, terms, packaging, contacts, notes, source_file, imported_at',
  products: 'id, price_list_id, model_code, name, description, kind, unit, website_slug, max_qty, ref_page, tech, sort, active',
  categories: 'key, name, labels, select_mode, required, sort',
  articles: 'code, product_id, category_key, sheet_category, "group", description, labels, price_cents, price_type, per_segment, segments, is_default, source, notes, sort, active',
};

const asObject = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const asArray = (v) => (Array.isArray(v) ? v : []);
/** tech is stored as jsonb; the seed writes [[label, value], …], an empty row may hold {}. */
const asTech = (v) => (Array.isArray(v) ? v.filter((r) => Array.isArray(r) && r.length === 2).map(([a, b]) => [String(a), String(b)]) : Object.entries(asObject(v)).map(([a, b]) => [a, String(b)]));

// `notes` (price list and article) hold the importer's internal remarks. The
// site never reads them, and this file is public, so they are written empty.
const mapPriceList = (r) => ({
  id: r.id, name: r.name, currency: r.currency, validFrom: r.valid_from ?? null, priceBasis: r.price_basis ?? null,
  terms: asObject(r.terms), packaging: asArray(r.packaging), contacts: asArray(r.contacts), notes: [],
  sourceFile: r.source_file ?? null, importedAt: r.imported_at,
});
const mapProduct = (r) => ({
  id: r.id, priceListId: r.price_list_id ?? null, modelCode: r.model_code ?? null, name: r.name, description: r.description ?? null,
  kind: r.kind, unit: r.unit, websiteSlug: r.website_slug ?? null, maxQty: r.max_qty, refPage: r.ref_page ?? null,
  tech: asTech(r.tech), sort: r.sort, active: Boolean(r.active),
});
const mapCategory = (r) => ({
  key: r.key, name: r.name, labels: asObject(r.labels), selectMode: r.select_mode, required: Boolean(r.required), sort: r.sort,
});
const mapArticle = (r) => ({
  code: r.code, productId: r.product_id, categoryKey: r.category_key, sheetCategory: r.sheet_category ?? null, group: r.group ?? null,
  description: r.description, labels: asObject(r.labels), priceCents: r.price_cents ?? null, priceType: r.price_type,
  perSegment: Boolean(r.per_segment), segments: r.segments ?? null, isDefault: Boolean(r.is_default), source: r.source,
  notes: null, sort: r.sort, active: Boolean(r.active),
});

try {
  const [pl, pr, ca, ar] = await Promise.all([
    db.from('price_lists').select(COLUMNS.price_lists).eq('active', true).order('id'),
    db.from('products').select(COLUMNS.products).eq('active', true).order('sort').order('id'),
    db.from('categories').select(COLUMNS.categories).order('sort').order('key'),
    db.from('articles').select(COLUMNS.articles).eq('active', true).order('sort').order('code'),
  ]);
  for (const [name, res] of [['price_lists', pl], ['products', pr], ['categories', ca], ['articles', ar]]) {
    if (res.error) throw new Error(`${name}: ${res.error.message}`);
  }
  const snapshot = {
    priceLists: (pl.data ?? []).map(mapPriceList),
    products: (pr.data ?? []).map(mapProduct),
    categories: (ca.data ?? []).map(mapCategory),
    articles: (ar.data ?? []).map(mapArticle),
    loadedAt: new Date().toISOString(),
    source: 'snapshot',
  };
  if (snapshot.products.length === 0 || snapshot.categories.length === 0 || snapshot.articles.length === 0) {
    keep(`the database returned an empty catalogue (${snapshot.products.length} products, ${snapshot.articles.length} articles)`);
  }
  const text = JSON.stringify(snapshot, null, 2);
  if (/purchase_cents|margin_cents|supplier_code/.test(text)) keep('refusing to write: the rows carry supplier columns');
  // Column names are one guard; text is the other — a remark about purchase
  // prices or margins in any field must not reach the public repository.
  if (/purchase price|purchase_price|\bmargins?\b|supplier cross-reference/i.test(text)) keep('refusing to write: a row mentions purchase prices, margins or the supplier sheet');
  mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
  writeFileSync(SNAPSHOT_PATH, text + '\n');
  const labelled = snapshot.articles.filter((a) => Object.keys(a.labels).length > 0).length;
  console.log(`[catalogue-snapshot] ${SNAPSHOT_REL}: ${snapshot.products.length} products, ${snapshot.categories.length} categories, ${snapshot.articles.length} articles (${labelled} with labels), price lists: ${snapshot.priceLists.map((p) => p.id).join(', ') || 'none'}`);
} catch (err) {
  keep(`database not reachable (${err?.message ?? err})`);
}
