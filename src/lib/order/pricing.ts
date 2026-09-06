/**
 * Order pricing. The browser uses these functions to show a running total;
 * the API route runs them again on the submitted order, so the amounts that
 * reach the confirmation e-mails never come from the client.
 *
 * Money is handled in whole cents to keep the VAT rounding exact.
 */
import { getOrderable, type OrderOption, type OrderableProduct } from './catalogue';
import { resolveVat, type VatInput, type VatMode } from './vat';

/** What the buyer picked: product quantity plus a quantity per option (0 = not selected). */
export interface OrderSelection {
  slug: string;
  quantity: number;
  options: Record<string, number>;
}

export interface PricedLine {
  id: string;
  kind: 'product' | 'option';
  /** How to label it: 'product' | 'addon' | 'order' (see catalogue.labelFrom) */
  labelFrom: 'product' | 'addon' | 'order';
  quantity: number;
  /** null when the price is quoted on request */
  unitPriceCents: number | null;
  totalCents: number | null;
}

export interface PricedOrder {
  slug: string;
  quantity: number;
  lines: PricedLine[];
  netCents: number;
  vatRate: number;
  vatMode: VatMode;
  vatCents: number;
  grossCents: number;
  /** true when at least one line is quoted on request, so the total is not final */
  hasOnRequestItems: boolean;
}

const clampInt = (value: unknown, min: number, max: number): number => {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
};

/** Coerce anything that arrived over the wire into a selection this catalogue allows. */
export function sanitiseSelection(input: unknown): OrderSelection | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const slug = typeof raw.slug === 'string' ? raw.slug : '';
  const product = getOrderable(slug);
  if (!product) return null;

  const quantity = clampInt(raw.quantity, 1, product.maxQty);
  const options: Record<string, number> = {};
  const submitted = (raw.options && typeof raw.options === 'object' ? raw.options : {}) as Record<string, unknown>;

  for (const option of product.options) {
    const value = submitted[option.id];
    if (value === undefined || value === null) continue;
    const max = option.kind === 'toggle' ? 1 : option.maxQty ?? 1;
    const qty = clampInt(value, 0, max);
    if (qty > 0) options[option.id] = qty;
  }

  return { slug, quantity, options };
}

function optionQuantity(option: OrderOption, optionQty: number, productQty: number): number {
  // A per-unit option is bought once per product; a quantity option carries its own count.
  return option.perUnit ? productQty : optionQty;
}

/** Line items for a selection, without VAT. */
export function priceLines(product: OrderableProduct, selection: OrderSelection): PricedLine[] {
  const lines: PricedLine[] = [
    {
      id: product.slug,
      kind: 'product',
      labelFrom: 'product',
      quantity: selection.quantity,
      unitPriceCents: product.unitPriceExclVat * 100,
      totalCents: product.unitPriceExclVat * 100 * selection.quantity,
    },
  ];

  for (const option of product.options) {
    const picked = selection.options[option.id] ?? 0;
    if (picked <= 0) continue;
    const quantity = optionQuantity(option, picked, selection.quantity);
    const unitPriceCents = option.priceExclVat === null ? null : option.priceExclVat * 100;
    lines.push({
      id: option.id,
      kind: 'option',
      labelFrom: option.labelFrom,
      quantity,
      unitPriceCents,
      totalCents: unitPriceCents === null ? null : unitPriceCents * quantity,
    });
  }

  return lines;
}

/** Full price of an order, including the VAT treatment. */
export function priceOrder(selection: OrderSelection, vat: VatInput): PricedOrder | null {
  const product = getOrderable(selection.slug);
  if (!product) return null;

  const lines = priceLines(product, selection);
  const netCents = lines.reduce((sum, line) => sum + (line.totalCents ?? 0), 0);
  const { rate, mode } = resolveVat(vat);
  const vatCents = Math.round(netCents * rate);

  return {
    slug: selection.slug,
    quantity: selection.quantity,
    lines,
    netCents,
    vatRate: rate,
    vatMode: mode,
    vatCents,
    grossCents: netCents + vatCents,
    hasOnRequestItems: lines.some((line) => line.totalCents === null),
  };
}

/** Money formatter for a locale, from cents. */
export function formatCents(cents: number, localeTag: string): string {
  return new Intl.NumberFormat(localeTag, { style: 'currency', currency: 'EUR' }).format(cents / 100);
}
