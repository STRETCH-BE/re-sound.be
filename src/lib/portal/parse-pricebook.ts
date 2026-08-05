// ============================================================================
// CLIENT PORTAL — Alto Pricing System workbook parser
//
// Reads ONLY the client-safe columns of the "PriceBook" sheet (Category, Code,
// Product, Unit, Market, Price EUR, Price PLN) plus the EUR→PLN rate from
// "Settings". Internal columns (Margin %, Cost EUR, …) are deliberately never
// read: they exist in the Excel only and must never reach the database.
//
// Keep scripts/seed-pricebook.mjs in sync with any change made here (same
// logic, standalone JS for CLI use).
// ============================================================================
import * as XLSX from 'xlsx';
import type { PriceRow } from './types';

export type ParsedPricebook = {
  rows: PriceRow[];
  fxEurPln: number | null;
  version: string;
  skipped: string[];
};

/** Categories whose rows get a visual sub-group derived from the brand token. */
const GROUPED_CATEGORIES = new Set([
  'Ceilings made-to-measure',
  'Rolls PVC foil',
  'Foil cut to length',
]);

/** Canonical casing for brand tokens that appear inconsistently in the sheet. */
const BRAND_CANON: Record<string, string> = {
  BAUF: 'Bauf',
  NewMAt: 'NewMat',
  SUFITY: 'Sufity',
};

function deriveGroup(category: string, product: string): string | null {
  if (!GROUPED_CATEGORIES.has(category)) return null;
  const token = product.trim().split(/\s+/)[0];
  if (!token) return null;
  return BRAND_CANON[token] ?? token;
}

function asText(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function asPrice(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

/**
 * Parse an uploaded .xlsx buffer. Throws with a human-readable message when
 * the workbook does not contain a usable PriceBook sheet.
 */
export function parsePricebookWorkbook(buffer: ArrayBuffer | Buffer): ParsedPricebook {
  const wb = XLSX.read(buffer, { type: buffer instanceof ArrayBuffer ? 'array' : 'buffer' });

  const sheetName = wb.SheetNames.find((n) => n.trim().toLowerCase() === 'pricebook');
  if (!sheetName) {
    throw new Error(
      `No "PriceBook" sheet found (sheets: ${wb.SheetNames.join(', ')}). Upload the Alto Pricing System workbook.`,
    );
  }

  const grid: unknown[][] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
    header: 1,
    raw: true,
    defval: null,
  });

  // Locate the header row and map the client-safe columns by name.
  const headerIdx = grid.findIndex(
    (row) =>
      Array.isArray(row) &&
      row.some((c) => asText(c) === 'Category') &&
      row.some((c) => asText(c) === 'Product'),
  );
  if (headerIdx === -1) {
    throw new Error('PriceBook sheet has no header row with "Category" and "Product" columns.');
  }
  const header = grid[headerIdx].map((c) => asText(c)?.toLowerCase() ?? '');
  const col = (name: string) => header.indexOf(name.toLowerCase());
  const cCat = col('Category');
  const cCode = col('Code');
  const cProd = col('Product');
  const cUnit = col('Unit');
  const cMarket = col('Market');
  const cEur = col('Price EUR');
  const cPln = col('Price PLN');
  if (cCat === -1 || cProd === -1 || cMarket === -1 || cEur === -1) {
    throw new Error('PriceBook sheet is missing one of: Category, Product, Market, Price EUR.');
  }

  const rows: PriceRow[] = [];
  const skipped: string[] = [];
  // The workbook's PriceBook contains rows that share Category+Product+Market
  // but are genuinely different products with different prices (e.g. PVC rolls
  // in two width bands whose distinguishing column was lost in the Excel's own
  // flattening). We keep ALL of them and disambiguate with an occurrence
  // sequence (seq: 1, 2, …) in sheet order — never silently drop priced rows.
  const seen = new Map<string, number>();
  let sort = 0;

  for (let i = headerIdx + 1; i < grid.length; i++) {
    const r = grid[i];
    if (!Array.isArray(r)) continue;
    const category = asText(r[cCat]);
    const product = asText(r[cProd]);
    const market = asText(r[cMarket]);
    if (!category || !product || !market) continue;

    const price_eur = asPrice(r[cEur]);
    if (price_eur === null) {
      skipped.push(`${product} [${market}] — missing Price EUR`);
      continue;
    }
    const key = `${category}||${product}||${market}`;
    const seq = (seen.get(key) ?? 0) + 1;
    seen.set(key, seq);
    sort += 1;

    rows.push({
      category,
      code: cCode === -1 ? null : asText(r[cCode]),
      product,
      unit: cUnit === -1 ? null : asText(r[cUnit]),
      market,
      price_eur,
      price_pln: cPln === -1 ? null : asPrice(r[cPln]),
      product_group: deriveGroup(category, product),
      seq,
      sort,
    });
  }

  if (rows.length === 0) throw new Error('PriceBook sheet contained no priced rows.');

  // EUR → PLN reference rate from the Settings sheet (optional).
  let fxEurPln: number | null = null;
  const settingsName = wb.SheetNames.find((n) => n.trim().toLowerCase() === 'settings');
  if (settingsName) {
    const settings: unknown[][] = XLSX.utils.sheet_to_json(wb.Sheets[settingsName], {
      header: 1,
      raw: true,
      defval: null,
    });
    const fxRow = settings.find((r) => Array.isArray(r) && asText(r[0]) === 'EUR → PLN');
    if (fxRow) fxEurPln = asPrice(fxRow[1]);
  }

  const now = new Date();
  const version = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return { rows, fxEurPln, version, skipped };
}
