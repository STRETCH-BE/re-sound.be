#!/usr/bin/env node
/**
 * Turns the re-sound booth price list workbook into seed SQL for the Supabase
 * catalogue (supabase/migrations/0001_catalogue_and_orders.sql).
 *
 *   node scripts/db/price-list-to-sql.mjs <price-list.xlsx> [--out supabase/seed] [--internal <dir>] [--snapshot <file>]
 *
 * Writes three files:
 *   <out>/booths-2026.sql          public catalogue: price list, products,
 *                                  categories, articles — safe to commit
 *   <snapshot>                     the same public rows as JSON in the shape of
 *                                  src/lib/catalogue/types.ts (Catalogue) —
 *                                  src/data/catalogue.snapshot.json, the
 *                                  fallback the site uses when the database
 *                                  cannot be reached. scripts/db/catalogue-snapshot.mjs
 *                                  refreshes it from the database (with the
 *                                  translated labels) before every build.
 *   <internal>/supplier-2026.sql   purchase prices and margins from the
 *                                  "Supplier cross-reference" sheet — NEVER
 *                                  commit this one (the repository is public)
 *
 * The workbook itself must not be committed either: it carries the supplier
 * sheet. Keep it with Michael and re-run this script when a new list arrives.
 *
 * Every statement is an upsert, so re-running with a corrected workbook
 * updates prices in place. Rows that disappear from the workbook are NOT
 * deleted — deactivate them by hand, so an old order's article still resolves.
 *
 * The script refuses to write anything if its own arithmetic does not match
 * the totals printed on the workbook (152 articles, 35 priced options, base
 * and option sales totals on the supplier sheet).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('usage: price-list-to-sql.mjs <price-list.xlsx> [--out dir] [--internal dir]');
  process.exit(2);
}
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const OUT_DIR = opt('--out', 'supabase/seed');
const INTERNAL_DIR = opt('--internal', join(process.env.TMPDIR ?? '/tmp', 're-sound-internal'));
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SNAPSHOT_PATH = opt('--snapshot', join(REPO_ROOT, 'src', 'data', 'catalogue.snapshot.json'));

// ---------------------------------------------------------------------------
// Workbook
// ---------------------------------------------------------------------------
const wb = XLSX.readFile(file, { cellFormula: false });
const rows = (name) => {
  const ws = wb.Sheets[name];
  if (!ws) throw new Error(`sheet "${name}" not found`);
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
};
const cell = (row, i) => (row && row[i] != null && row[i] !== '' ? row[i] : null);
const text = (v) => (v == null ? null : String(v).trim());
/** A note as it may appear in the public seed: any pointer at the supplier sheet is dropped. */
const publicNote = (note) => {
  if (!note) return note;
  const cleaned = note.replace(/\s*[-–—]?\s*see supplier cross-reference\.?/i, '').trim();
  return cleaned || null;
};
const cents = (v) => {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  if (!Number.isFinite(n)) throw new Error(`not a price: ${v}`);
  return Math.round(n * 100);
};

// ---------------------------------------------------------------------------
// Fixed mappings — the workbook's own wording, mapped to database keys
// ---------------------------------------------------------------------------
const PRICE_LIST_ID = 'booths-2026';

/**
 * Translations of category names and article descriptions, keyed by the
 * English text (content/catalogue-labels.json, written from the translation
 * pass; scripts/db/labels-to-sql.mjs applies the same file to the database).
 */
const LABELS = (() => {
  const p = join(REPO_ROOT, 'content', 'catalogue-labels.json');
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return { categories: {}, descriptions: {} }; }
})();
const labelsFor = (description) => LABELS.descriptions?.[description] ?? {};

/** The product pages' own add-on copy, already translated per locale. */
const SITE_LOCALES = ['en', 'nl', 'fr', 'de', 'es', 'pt', 'da', 'sv', 'no', 'is'];
const MESSAGES = Object.fromEntries(SITE_LOCALES.map((l) => {
  try { return [l, JSON.parse(readFileSync(join(REPO_ROOT, 'messages', `${l}.json`), 'utf8'))]; } catch { return [l, {}]; }
}));

/** Model sheets → product ids, with the page each model is sold from. */
const MODELS = [
  { sheet: 'Solo ECO Stand', id: 'solo-eco', code: 'SE', websiteSlug: 'solo-eco' },
  { sheet: 'Solo Flex', id: 'solo-flex', code: 'SF', websiteSlug: 'solo-flex' },
  { sheet: 'Solo Stand', id: 'solo-stand', code: 'SS', websiteSlug: null },
  { sheet: 'Duo Work', id: 'duo-work', code: 'DW', websiteSlug: 'duo' },
  { sheet: 'Duo Flex', id: 'duo-flex', code: 'DF', websiteSlug: 'duo' },
  { sheet: 'Modular 4', id: 'modular-4', code: 'M4', websiteSlug: null },
  { sheet: 'Modular XL', id: 'modular-xl', code: 'MX', websiteSlug: 'modular-xl' },
];

/** Category on the model sheet → catalogue category key. */
const CATEGORY_KEY = {
  'Construction': 'construction',
  'Base': 'construction',
  'Additional segments': 'additional_segments',
  'Exterior color': 'exterior_color',
  'Interior felt color': 'interior_felt',
  'Middle console color': 'middle_console',
  'Table': 'table',
  'Desk': 'table',
  'Sofas (2 pieces)': 'sofas',
  'Door orientation': 'door_orientation',
  'Power / socket config': 'power_socket',
  'Options': 'options',
  'Fire protection': 'fire_protection',
};

/** Catalogue categories, in the order the configurator shows them. */
const CATEGORIES = [
  { key: 'construction', name: 'Construction', mode: 'single', required: true },
  { key: 'additional_segments', name: 'Additional segments', mode: 'single', required: false },
  { key: 'exterior_color', name: 'Exterior colour', mode: 'single', required: true },
  { key: 'interior_felt', name: 'Interior felt colour', mode: 'single', required: true },
  { key: 'middle_console', name: 'Middle console colour', mode: 'single', required: true },
  { key: 'table', name: 'Table / desk', mode: 'single', required: true },
  { key: 'sofas', name: 'Sofas', mode: 'single', required: true },
  { key: 'door_orientation', name: 'Door orientation', mode: 'single', required: true },
  { key: 'power_socket', name: 'Power / socket configuration', mode: 'single', required: true },
  { key: 'options', name: 'Accessories', mode: 'multi', required: false },
  { key: 'fire_protection', name: 'Fire protection', mode: 'multi', required: false },
  { key: 'installation', name: 'Installation', mode: 'multi', required: false },
];

const PRICE_TYPE = { 'Base price': 'base', 'Included': 'included', 'Option': 'option', 'Credit': 'credit' };

/**
 * Modular XL is priced per 0.9 m segment for fire protection. The base module
 * is 180 cm deep (two segments); each extension article adds its own.
 */
const SEGMENTS = { 'RS-MX-BF': 2, 'RS-MX-BG': 2, 'RS-MX-AS1': 1, 'RS-MX-AS2': 2, 'RS-MX-AS3': 3 };
const PER_SEGMENT = new Set(['RS-MX-FP']);

/**
 * Services priced by Michael on 12 Sep 2026 (not on the workbook): transport
 * within mainland Europe and installation by Re-Sound, per unit, excl. VAT,
 * for the booths sold online. Products absent here keep installation on
 * request and get no transport line. The same rows are in
 * supabase/migrations/0003_transport_and_installation_prices.sql; the seed
 * emits them as the block "Services priced by Michael, 12 Sep 2026".
 *
 * `auto` categories are never offered as a choice: the site adds their line
 * by rule (src/lib/catalogue/select.ts, canonicalSelection). The extension
 * rule: the Modular XL extra-element installation line is per_extension —
 * quantity × extension segments (RS-MX-AS1 = 1, AS2 = 2, AS3 = 3), and it is
 * added only when installation is chosen and an extension is selected.
 */
const SERVICES = {
  date: '12 Sep 2026',
  installation: { 'solo-eco': 87500, 'solo-flex': 124500, 'duo-work': 124500, 'duo-flex': 124500, 'modular-xl': 164500 },
  transport: { 'solo-eco': 30000, 'solo-flex': 50000, 'duo-work': 50000, 'duo-flex': 50000, 'modular-xl': 75000 },
  extension: {
    productId: 'modular-xl', code: 'WEB-MODULAR-XL-INST-EXT', priceCents: 124500,
    mainModuleDescription: 'Installation by Re-Sound (main module)',
    description: 'Installation of an extra element',
    notes: 'Michael, 12 Sep 2026: € 1 245 per extra module; added automatically when installation is chosen',
  },
  categories: [
    { key: 'installation_extension', name: 'Installation of extra elements', mode: 'auto', required: false, sort: 13 },
    { key: 'transport', name: 'Transport', mode: 'auto', required: false, sort: 14 },
  ],
  transportDescription: { EU: 'Transport within mainland Europe', XX: 'Transport outside mainland Europe' },
  transportNotesXX: 'Outside mainland Europe transport is quoted with the order confirmation',
};
/** 124500 → "€ 1 245", as the notes write it. */
const euros = (cents) => `€ ${String(Math.round(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;

// ---------------------------------------------------------------------------
// Overview → reference pages
// ---------------------------------------------------------------------------
const overview = rows('Overview');
const refPage = new Map();
for (const r of overview) {
  const model = text(cell(r, 0));
  const page = cell(r, 7);
  if (model && typeof page === 'number') refPage.set(model, page);
}
// Workbook housekeeping notes that mention the supplier sheet, purchase
// prices or margins stay out of the public seed (the snapshot carries none).
const overviewNotes = overview
  .map((r) => text(cell(r, 0)))
  .filter((v) => v && v.startsWith('•'))
  .map((v) => v.replace(/^•\s*/, ''))
  .filter((v) => !/supplier|purchase|margin/i.test(v));

// ---------------------------------------------------------------------------
// All options → group per article
// ---------------------------------------------------------------------------
const groupOf = new Map();
for (const r of rows('All options')) {
  const code = text(cell(r, 0));
  if (code && /^RS-/.test(code)) groupOf.set(code, text(cell(r, 3)));
}

// ---------------------------------------------------------------------------
// Model sheets → products + articles
// ---------------------------------------------------------------------------
const products = [];
const articles = [];

for (const [sort, model] of MODELS.entries()) {
  const sheet = rows(model.sheet);
  const description = text(cell(sheet[1], 0));
  let name = null;
  let sortInProduct = 0;
  let i = 5; // row 6 in Excel
  for (; i < sheet.length; i += 1) {
    const r = sheet[i];
    const product = text(cell(r, 0));
    const code = text(cell(r, 3));
    if (!product || !code || !/^RS-/.test(code)) break;
    name = name ?? product;
    const sheetCategory = text(cell(r, 1));
    const key = CATEGORY_KEY[sheetCategory];
    if (!key) throw new Error(`${model.sheet}: unknown category "${sheetCategory}" on ${code}`);
    const priceType = PRICE_TYPE[text(cell(r, 5))];
    if (!priceType) throw new Error(`${model.sheet}: unknown price type "${cell(r, 5)}" on ${code}`);
    const price = cents(cell(r, 4));
    if (price === null) throw new Error(`${model.sheet}: no price on ${code}`);
    sortInProduct += 1;
    articles.push({
      code,
      productId: model.id,
      categoryKey: key,
      sheetCategory,
      group: groupOf.get(code) ?? null,
      description: text(cell(r, 2)),
      priceCents: price,
      priceType,
      perSegment: PER_SEGMENT.has(code),
      segments: SEGMENTS[code] ?? null,
      notes: publicNote(text(cell(r, 6))),
      sort: sortInProduct,
      source: 'price-list',
    });
  }
  // Technical & logistics data block: label in A, value in C.
  const tech = [];
  const start = sheet.findIndex((r) => text(cell(r, 0)) === 'Technical & logistics data');
  if (start >= 0) {
    for (let j = start + 1; j < sheet.length; j += 1) {
      const label = text(cell(sheet[j], 0));
      const value = text(cell(sheet[j], 2));
      if (label && value) tech.push([label, value]);
    }
  }
  if (!name) throw new Error(`${model.sheet}: no article rows`);
  products.push({
    id: model.id,
    priceListId: PRICE_LIST_ID,
    modelCode: model.code,
    name,
    description,
    kind: 'booth',
    unit: 'booth',
    websiteSlug: model.websiteSlug,
    maxQty: 25,
    refPage: refPage.get(name) ?? null,
    tech,
    sort: sort + 1,
  });
}

// Defaults: the "(standard)" row, else the first base/included row of each
// single-select category. Additional segments have no default (none is a
// valid choice) and multi-select categories never do.
const single = new Set(CATEGORIES.filter((c) => c.mode === 'single' && c.key !== 'additional_segments').map((c) => c.key));
for (const p of products) {
  for (const key of single) {
    const group = articles.filter((a) => a.productId === p.id && a.categoryKey === key);
    if (group.length === 0) continue;
    const standard = group.find((a) => /\(standard\)/i.test(a.description));
    const first = group.find((a) => a.priceType === 'base' || a.priceType === 'included') ?? group[0];
    (standard ?? first).isDefault = true;
  }
}

// ---------------------------------------------------------------------------
// The two textile products the site sells (not on the booth list) and the
// installation service on every product — website-defined rows. Installation
// is priced from SERVICES for the booths sold online and on request for the
// rest until Re-Sound confirms a figure.
// ---------------------------------------------------------------------------
products.push(
  {
    id: 'interior', priceListId: null, modelCode: null, name: 'Interior',
    description: 'Acoustic wall panel, recycled textile fibres', kind: 'panel', unit: 'set',
    websiteSlug: 'interior', maxQty: 200, refPage: null, tech: [], sort: 20,
  },
  {
    id: 'divide', priceListId: null, modelCode: null, name: 'Divide',
    description: 'Free-standing acoustic screen, recycled textile fibres', kind: 'panel', unit: 'piece',
    websiteSlug: 'divide', maxQty: 200, refPage: null, tech: [], sort: 21,
  },
  {
    id: 'solid', priceListId: null, modelCode: null, name: 'Solid',
    description: 'Large-format acoustic wall panel, recycled textile fibres', kind: 'panel', unit: 'piece',
    websiteSlug: 'solid', maxQty: 200, refPage: null, tech: [], sort: 22,
  },
);
articles.push(
  {
    code: 'WEB-INTERIOR-SET', productId: 'interior', categoryKey: 'construction', sheetCategory: null, group: 'Body / construction',
    description: 'Interior acoustic panel, per set', priceCents: 38700, priceType: 'base', perSegment: false, segments: null,
    notes: 'Michael, 6 Sep 2026: € 387 excl. VAT per set', sort: 1, source: 'website', isDefault: true,
  },
  {
    code: 'WEB-DIVIDE-PIECE', productId: 'divide', categoryKey: 'construction', sheetCategory: null, group: 'Body / construction',
    description: 'Divide acoustic screen, per piece', priceCents: 123800, priceType: 'base', perSegment: false, segments: null,
    notes: 'Product page: from € 1 238 excl. VAT per piece', sort: 1, source: 'website', isDefault: true,
  },
  {
    code: 'WEB-SOLID-PIECE', productId: 'solid', categoryKey: 'construction', sheetCategory: null, group: 'Body / construction',
    description: 'Solid acoustic panel, per piece', priceCents: 40700, priceType: 'base', perSegment: false, segments: null,
    notes: 'Product page: "Starting from € 407 excl. VAT per panel". Not yet confirmed by Michael (docs/prices-needed.md, block C).', sort: 1, source: 'website', isDefault: true,
  },
);
for (const p of products) {
  const priceCents = SERVICES.installation[p.id] ?? null;
  const main = p.id === SERVICES.extension.productId;
  articles.push({
    code: `WEB-${p.id.toUpperCase()}-INST`, productId: p.id, categoryKey: 'installation', sheetCategory: null, group: 'Services',
    description: main ? SERVICES.extension.mainModuleDescription : 'Installation by Re-Sound', priceCents, priceType: 'option',
    perSegment: false, segments: null,
    notes: priceCents === null
      ? 'Price list 2026: delivery and installation are optional and quoted separately. No confirmed figure yet.'
      : `Michael, ${SERVICES.date}: ${euros(priceCents)} excl. VAT`,
    sort: 900, source: 'website',
  });
}

// ---------------------------------------------------------------------------
// Services priced by Michael (SERVICES): the extra-element installation line
// and the transport lines. Emitted as their own block so the seed reads like
// the migration that introduced them.
// ---------------------------------------------------------------------------
const serviceArticles = [];
{
  const e = SERVICES.extension;
  serviceArticles.push({
    code: e.code, productId: e.productId, categoryKey: 'installation_extension', sheetCategory: null, group: 'Services',
    description: e.description, priceCents: e.priceCents, priceType: 'option', perSegment: false, perExtension: true, segments: null,
    isDefault: false, notes: e.notes, sort: 901, source: 'website',
  });
  for (const [productId, cents] of Object.entries(SERVICES.transport)) {
    const prefix = `WEB-${productId.toUpperCase()}-TRANSPORT`;
    serviceArticles.push(
      {
        code: `${prefix}-EU`, productId, categoryKey: 'transport', sheetCategory: null, group: 'Services',
        description: SERVICES.transportDescription.EU, priceCents: cents, priceType: 'option', perSegment: false, perExtension: false,
        segments: null, isDefault: true, notes: `Michael, ${SERVICES.date}: ${euros(cents)} within mainland Europe, per unit`, sort: 950, source: 'website',
      },
      {
        code: `${prefix}-XX`, productId, categoryKey: 'transport', sheetCategory: null, group: 'Services',
        description: SERVICES.transportDescription.XX, priceCents: null, priceType: 'option', perSegment: false, perExtension: false,
        segments: null, isDefault: false, notes: SERVICES.transportNotesXX, sort: 951, source: 'website',
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Add-ons the product pages advertise that are not on the price list. They
// keep being offered, on request, under their existing translated titles
// (messages/<locale>.json <page>.addons.<id>.title) until Re-Sound maps them
// to a list article or prices them (docs/prices-needed.md, block B). Two of
// them duplicate what the list already covers and stay inactive.
// ---------------------------------------------------------------------------
const PAGE_ADDONS = [
  { ns: 'soloFlexPage', productIds: ['solo-flex'] },
  { ns: 'duoPage', productIds: ['duo-work', 'duo-flex'] },
  { ns: 'modularXlPage', productIds: ['modular-xl'] },
];
const ADDON_COVERED_BY_LIST = new Set(['solo-flex:sitStandDesk', 'duo-work:electricDesk', 'duo-flex:electricDesk']);
for (const page of PAGE_ADDONS) {
  const addons = MESSAGES.en?.[page.ns]?.addons ?? {};
  const ids = Object.keys(addons).filter((id) => addons[id] && addons[id].title);
  for (const productId of page.productIds) {
    ids.forEach((id, i) => {
      const labels = {};
      for (const l of SITE_LOCALES) {
        if (l === 'en') continue;
        const title = MESSAGES[l]?.[page.ns]?.addons?.[id]?.title;
        if (title) labels[l] = title;
      }
      const covered = ADDON_COVERED_BY_LIST.has(`${productId}:${id}`);
      articles.push({
        code: `WEB-${productId.toUpperCase()}-${id.toUpperCase()}`, productId, categoryKey: 'options', sheetCategory: null,
        group: 'Page add-ons', description: addons[id].title, labels, priceCents: null, priceType: 'option',
        perSegment: false, segments: null, sort: 500 + i, source: 'website', active: !covered,
        notes: 'Advertised on the product page; not on the 2026 price list. Confirm the mapping to a list article or give a price (docs/prices-needed.md, block B).'
          + (covered ? ' Inactive: the list already covers this (Solo Flex table is sit/stand; Duo desk = RS-DW/DF-TW/TA).' : ''),
      });
    });
  }
}

// ---------------------------------------------------------------------------
// Terms & contacts → price list row
// ---------------------------------------------------------------------------
const termsSheet = rows('Terms & contacts');
const terms = {};
let validFrom = null;
let priceBasis = null;
for (const r of termsSheet.slice(5, 21)) {
  const label = text(cell(r, 0));
  const value = text(cell(r, 1));
  if (!label || !value) continue;
  terms[label] = value;
  if (label === 'Valid from') {
    const m = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (m) validFrom = `${m[3]}-${m[2]}-${m[1]}`;
  }
  if (label === 'Price basis') priceBasis = value;
}
const packaging = [];
for (const r of termsSheet.slice(24, 32)) {
  const model = text(cell(r, 0));
  if (!model) continue;
  packaging.push({ model, unit: text(cell(r, 1)), pallet: text(cell(r, 2)), grossKg: cell(r, 3) });
}
const contacts = [];
for (const r of termsSheet.slice(35)) {
  const territory = text(cell(r, 0));
  if (!territory || !text(cell(r, 1))) continue;
  const phone = cell(r, 3);
  contacts.push({
    territory,
    name: text(cell(r, 1)),
    email: text(cell(r, 2)),
    phone: phone == null ? null : `+${String(phone).replace(/^\+/, '')}`,
    base: text(cell(r, 4)),
  });
}

// ---------------------------------------------------------------------------
// Supplier cross-reference (internal)
// ---------------------------------------------------------------------------
const supplierSheet = rows('Supplier cross-reference');
const supplierName = (text(cell(supplierSheet[2], 0)) ?? '').match(/Supplier:\s*(.+?)\.?$/)?.[1] ?? 'supplier';
const supplier = [];
let supplierBaseTotal = null;
let supplierOptionTotal = null;
for (const r of supplierSheet.slice(5)) {
  const code = text(cell(r, 0));
  const label = text(cell(r, 2));
  if (label === 'Base units only - total purchase / sales / margin') supplierBaseTotal = cents(cell(r, 5));
  if (label === 'Priced options only - total purchase / sales / margin') supplierOptionTotal = cents(cell(r, 5));
  if (!code || !/^RS-/.test(code)) continue;
  supplier.push({
    code,
    supplierCode: text(cell(r, 3)),
    purchaseCents: cents(cell(r, 4)),
    salesCents: cents(cell(r, 5)),
    marginCents: cents(cell(r, 6)),
  });
}

// ---------------------------------------------------------------------------
// Checks against the workbook's own totals — refuse to write on a mismatch
// ---------------------------------------------------------------------------
const listArticles = articles.filter((a) => a.source === 'price-list');
const allOptions = rows('All options');
const printedCount = cents(cell(allOptions.find((r) => text(cell(r, 4)) === 'Total articles listed'), 5)) / 100;
const printedPriced = cents(cell(allOptions.find((r) => text(cell(r, 4)) === 'of which priced accessories and options'), 5)) / 100;
const pricedOptions = listArticles.filter((a) => a.priceType === 'option' && a.priceCents !== 0).length;
const baseTotal = listArticles.filter((a) => a.priceType === 'base').reduce((s, a) => s + a.priceCents, 0);
const optionTotal = listArticles.filter((a) => a.priceType === 'option' && a.priceCents !== 0).reduce((s, a) => s + a.priceCents, 0);

const problems = [];
if (listArticles.length !== printedCount) problems.push(`articles: read ${listArticles.length}, workbook says ${printedCount}`);
if (pricedOptions !== printedPriced) problems.push(`priced options: read ${pricedOptions}, workbook says ${printedPriced}`);
if (supplierBaseTotal !== null && baseTotal !== supplierBaseTotal) problems.push(`base total: ${baseTotal} vs supplier sheet ${supplierBaseTotal}`);
if (supplierOptionTotal !== null && optionTotal !== supplierOptionTotal) problems.push(`option total: ${optionTotal} vs supplier sheet ${supplierOptionTotal}`);
for (const s of supplier) {
  const a = listArticles.find((x) => x.code === s.code);
  if (!a) problems.push(`supplier row ${s.code} has no article`);
  else if (a.priceCents !== s.salesCents) problems.push(`${s.code}: model sheet ${a.priceCents} ≠ supplier sheet ${s.salesCents}`);
}
const codes = new Set();
for (const a of [...articles, ...serviceArticles]) {
  if (codes.has(a.code)) problems.push(`duplicate article ${a.code}`);
  codes.add(a.code);
}
if (problems.length) {
  console.error('Refusing to write: the workbook does not add up.\n  ' + problems.join('\n  '));
  process.exit(1);
}

// ---------------------------------------------------------------------------
// SQL
// ---------------------------------------------------------------------------
const q = (v) => (v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const j = (v) => `${q(JSON.stringify(v))}::jsonb`;
const b = (v) => (v ? 'true' : 'false');
const n = (v) => (v == null ? 'null' : String(v));
const arr = (list) => `array[${list.map(q).join(', ')}]::text[]`;

const lines = [];
lines.push(`-- Generated by scripts/db/price-list-to-sql.mjs from ${basename(file)} on ${new Date().toISOString().slice(0, 10)}.`);
lines.push('-- Public catalogue only. Purchase prices and margins are in a separate file that is never committed.');
lines.push('begin;');
lines.push('');
lines.push(`insert into public.price_lists (id, name, currency, valid_from, price_basis, terms, packaging, contacts, notes, source_file, active) values (
  ${q(PRICE_LIST_ID)}, ${q(terms['Price list'] ?? 'Price list 2026')}, ${q(terms['Currency'] ?? 'EUR')}, ${q(validFrom)}, ${q(priceBasis)},
  ${j(terms)}, ${j(packaging)}, ${j(contacts)}, ${arr(overviewNotes)}, ${q(basename(file))}, true)
on conflict (id) do update set name = excluded.name, currency = excluded.currency, valid_from = excluded.valid_from,
  price_basis = excluded.price_basis, terms = excluded.terms, packaging = excluded.packaging, contacts = excluded.contacts,
  notes = excluded.notes, source_file = excluded.source_file, imported_at = now(), active = true;`);
lines.push('');
lines.push(`insert into public.categories (key, name, labels, select_mode, required, sort) values
${CATEGORIES.map((c, i) => `  (${q(c.key)}, ${q(c.name)}, ${j(LABELS.categories?.[c.key] ?? {})}, ${q(c.mode)}, ${b(c.required)}, ${i + 1})`).join(',\n')}
on conflict (key) do update set name = excluded.name, labels = excluded.labels, select_mode = excluded.select_mode, required = excluded.required, sort = excluded.sort;`);
lines.push('');
lines.push(`insert into public.products (id, price_list_id, model_code, name, description, kind, unit, website_slug, max_qty, ref_page, tech, sort, active) values
${products.map((p) => `  (${q(p.id)}, ${q(p.priceListId)}, ${q(p.modelCode)}, ${q(p.name)}, ${q(p.description)}, ${q(p.kind)}, ${q(p.unit)}, ${q(p.websiteSlug)}, ${p.maxQty}, ${n(p.refPage)}, ${j(p.tech)}, ${p.sort}, true)`).join(',\n')}
on conflict (id) do update set price_list_id = excluded.price_list_id, model_code = excluded.model_code, name = excluded.name,
  description = excluded.description, kind = excluded.kind, unit = excluded.unit, website_slug = excluded.website_slug,
  max_qty = excluded.max_qty, ref_page = excluded.ref_page, tech = excluded.tech, sort = excluded.sort, active = true, updated_at = now();`);
lines.push('');
const articleRow = (a) => `  (${q(a.code)}, ${q(a.productId)}, ${q(a.categoryKey)}, ${q(a.sheetCategory)}, ${q(a.group)}, ${q(a.description)}, ${j(a.labels ?? labelsFor(a.description))}, ${n(a.priceCents)}, ${q(a.priceType)}, ${b(a.perSegment)}, ${b(a.perExtension ?? false)}, ${n(a.segments)}, ${b(a.isDefault)}, ${q(a.source)}, ${q(a.notes)}, ${a.sort}, ${b(a.active ?? true)})`;
const articlesInsert = (list) => `insert into public.articles (code, product_id, category_key, sheet_category, "group", description, labels, price_cents, price_type, per_segment, per_extension, segments, is_default, source, notes, sort, active) values
${list.map(articleRow).join(',\n')}
on conflict (code) do update set product_id = excluded.product_id, category_key = excluded.category_key, sheet_category = excluded.sheet_category,
  "group" = excluded."group", description = excluded.description, labels = excluded.labels, price_cents = excluded.price_cents, price_type = excluded.price_type,
  per_segment = excluded.per_segment, per_extension = excluded.per_extension, segments = excluded.segments, is_default = excluded.is_default, source = excluded.source,
  notes = excluded.notes, sort = excluded.sort, active = excluded.active, updated_at = now();`;
lines.push(articlesInsert(articles));
lines.push('');
lines.push(`-- ---------------------------------------------------------------------------
-- Services priced by Michael, ${SERVICES.date} (scripts/db/price-list-to-sql.mjs, SERVICES):
-- the two auto categories and the transport / extra-element lines. The
-- WEB-…-INST prices above come from the same constant. Same rows as
-- supabase/migrations/0003_transport_and_installation_prices.sql.
-- ---------------------------------------------------------------------------
insert into public.categories (key, name, labels, select_mode, required, sort) values
${SERVICES.categories.map((c) => `  (${q(c.key)}, ${q(c.name)}, ${j(LABELS.categories?.[c.key] ?? {})}, ${q(c.mode)}, ${b(c.required)}, ${c.sort})`).join(',\n')}
on conflict (key) do update set name = excluded.name, labels = excluded.labels, select_mode = excluded.select_mode, required = excluded.required, sort = excluded.sort;`);
lines.push('');
lines.push(articlesInsert(serviceArticles));
lines.push('');
lines.push('commit;');

mkdirSync(OUT_DIR, { recursive: true });
const publicPath = join(OUT_DIR, `${PRICE_LIST_ID}.sql`);
writeFileSync(publicPath, lines.join('\n') + '\n');

// ---------------------------------------------------------------------------
// Snapshot — the public rows again, as the Catalogue shape the site reads
// (src/lib/catalogue/types.ts). Labels come from content/catalogue-labels.json
// (and, for page add-ons, from messages/*.json); scripts/db/catalogue-snapshot.mjs
// refreshes the whole file from the database when it is reachable.
// Nothing from the supplier sheet is written to this file.
// ---------------------------------------------------------------------------
const generatedAt = new Date().toISOString();
const snapshot = {
  priceLists: [{
    id: PRICE_LIST_ID,
    name: terms['Price list'] ?? 'Price list 2026',
    currency: terms['Currency'] ?? 'EUR',
    validFrom,
    priceBasis,
    terms,
    packaging,
    contacts,
    notes: [], // internal remarks stay out of the public snapshot (see catalogue-snapshot.mjs)
    sourceFile: basename(file),
    importedAt: generatedAt,
  }],
  products: products.map((p) => ({
    id: p.id, priceListId: p.priceListId, modelCode: p.modelCode, name: p.name, description: p.description,
    kind: p.kind, unit: p.unit, websiteSlug: p.websiteSlug, maxQty: p.maxQty, refPage: p.refPage,
    tech: p.tech, sort: p.sort, active: true,
  })),
  categories: [
    ...CATEGORIES.map((c, i) => ({
      key: c.key, name: c.name, labels: LABELS.categories?.[c.key] ?? {}, selectMode: c.mode, required: c.required, sort: i + 1,
    })),
    ...SERVICES.categories.map((c) => ({
      key: c.key, name: c.name, labels: LABELS.categories?.[c.key] ?? {}, selectMode: c.mode, required: c.required, sort: c.sort,
    })),
  ],
  articles: [...articles, ...serviceArticles].map((a) => ({
    code: a.code, productId: a.productId, categoryKey: a.categoryKey, sheetCategory: a.sheetCategory, group: a.group,
    description: a.description, labels: a.labels ?? labelsFor(a.description), priceCents: a.priceCents, priceType: a.priceType,
    perSegment: a.perSegment, perExtension: a.perExtension ?? false, segments: a.segments, isDefault: Boolean(a.isDefault), source: a.source,
    notes: null, sort: a.sort, active: a.active ?? true,
  })),
  loadedAt: generatedAt,
  source: 'snapshot',
};
mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + '\n');

const internal = [];
internal.push(`-- INTERNAL — purchase prices and margins from ${basename(file)}. Do not commit, do not share.`);
internal.push('begin;');
internal.push(`insert into public.supplier_articles (article_code, supplier, supplier_code, purchase_cents, sales_cents, margin_cents) values
${supplier.map((s) => `  (${q(s.code)}, ${q(supplierName)}, ${q(s.supplierCode)}, ${n(s.purchaseCents)}, ${n(s.salesCents)}, ${n(s.marginCents)})`).join(',\n')}
on conflict (article_code) do update set supplier = excluded.supplier, supplier_code = excluded.supplier_code,
  purchase_cents = excluded.purchase_cents, sales_cents = excluded.sales_cents, margin_cents = excluded.margin_cents;`);
internal.push('commit;');
mkdirSync(INTERNAL_DIR, { recursive: true });
const internalPath = join(INTERNAL_DIR, 'supplier-2026.sql');
writeFileSync(internalPath, internal.join('\n') + '\n');

console.log(JSON.stringify({
  publicSeed: publicPath,
  snapshot: SNAPSHOT_PATH,
  internalSeed: internalPath,
  products: products.length,
  articles: { total: articles.length, fromPriceList: listArticles.length, website: articles.length - listArticles.length },
  pricedOptions,
  baseTotalCents: baseTotal,
  optionTotalCents: optionTotal,
  validFrom,
  supplierRows: supplier.length,
}, null, 2));
