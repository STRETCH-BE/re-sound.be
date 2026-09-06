/**
 * What can be ordered online, and what an order may contain.
 *
 * Only products with a price confirmed by Re-Sound appear here — everything
 * else keeps the "Request a quote" route. Option prices are the ones from the
 * content workbook (Booth_Guide) and from Michael; an option whose price is
 * not confirmed is offered as "price on request" and is quoted by Re-Sound
 * before the order is accepted, rather than being given an invented number.
 *
 * Transport is never included in these prices (it depends on the delivery
 * address) and is quoted separately.
 */
import { PRODUCTS } from '@/data/products';

export type OptionKind = 'toggle' | 'quantity';

export interface OrderOption {
  id: string;
  kind: OptionKind;
  /**
   * Where the visible label comes from:
   *  - 'addon'  → <product namespace>.addons.<id>.title / .desc (already translated)
   *  - 'order'  → order.options.<id>.label / .desc
   */
  labelFrom: 'addon' | 'order';
  /** Price per unit in EUR, excl. VAT; null = quoted on request */
  priceExclVat: number | null;
  /** true: multiplied by the number of products ordered; false: by the option's own quantity */
  perUnit: boolean;
  /** Only for kind 'quantity' */
  maxQty?: number;
  /** Extra note shown under the option: order.options.<id>.note */
  hasNote?: boolean;
}

export interface OrderableProduct {
  slug: string;
  /** Confirmed price per unit, excl. VAT (mirrors PRODUCTS[slug].fromPrice) */
  unitPriceExclVat: number;
  /** hubs.shared.units.* key for the unit shown next to the price */
  unitKey: 'booth' | 'set' | 'piece' | 'm2';
  maxQty: number;
  options: OrderOption[];
}

const BOOTH_ADDON_OPTIONS = (ids: string[]): OrderOption[] =>
  ids.map((id) => ({ id, kind: 'toggle' as const, labelFrom: 'addon' as const, priceExclVat: null, perUnit: true }));

export const ORDERABLE: Record<string, OrderableProduct> = {
  'solo-flex': {
    slug: 'solo-flex',
    unitPriceExclVat: 2740,
    unitKey: 'booth',
    maxQty: 25,
    options: [
      // Booth_Guide: € 3 605 incl. installation − € 2 740 = € 865 per booth
      { id: 'installation', kind: 'toggle', labelFrom: 'order', priceExclVat: 865, perUnit: true, hasNote: true },
      ...BOOTH_ADDON_OPTIONS(['sitStandDesk', 'monitorMount', 'cableManagement', 'shelf', 'extraFan', 'fabricPanel']),
    ],
  },
  duo: {
    slug: 'duo',
    unitPriceExclVat: 7615,
    unitKey: 'booth',
    maxQty: 25,
    // Michael, 6 Sep 2026: € 7 615 excl. VAT; the installation price for Duo
    // is not confirmed yet, so it is quoted on request.
    options: [
      { id: 'installation', kind: 'toggle', labelFrom: 'order', priceExclVat: null, perUnit: true, hasNote: true },
      ...BOOTH_ADDON_OPTIONS(['electricDesk', 'monitorMount', 'displaySystem', 'cableManagement', 'extraSeating', 'fabricPanel']),
    ],
  },
  'modular-xl': {
    slug: 'modular-xl',
    unitPriceExclVat: 15000,
    unitKey: 'booth',
    maxQty: 10,
    options: [
      // Booth_Guide: € 17 990 incl. installation − € 15 000 = € 2 990 per pod
      { id: 'installation', kind: 'toggle', labelFrom: 'order', priceExclVat: 2990, perUnit: true, hasNote: true },
      // Booth_Guide: extra 90 cm element € 7 264 including installation
      { id: 'extraElement', kind: 'quantity', labelFrom: 'order', priceExclVat: 7264, perUnit: false, maxQty: 8, hasNote: true },
      ...BOOTH_ADDON_OPTIONS(['meetingTable', 'displaySystem', 'videoConference', 'cableManagement', 'whiteboard', 'fabricPanel']),
    ],
  },
  interior: {
    slug: 'interior',
    unitPriceExclVat: 387,
    unitKey: 'set',
    maxQty: 200,
    options: [{ id: 'installation', kind: 'toggle', labelFrom: 'order', priceExclVat: null, perUnit: false, hasNote: true }],
  },
  divide: {
    slug: 'divide',
    unitPriceExclVat: 1238,
    unitKey: 'piece',
    maxQty: 200,
    options: [],
  },
};

export const ORDERABLE_SLUGS = Object.keys(ORDERABLE);

export function isOrderable(slug: string): boolean {
  return slug in ORDERABLE;
}

/**
 * The catalogue entry, checked against src/data/products.ts so a price that
 * changes in one place can never silently disagree with the other.
 */
export function getOrderable(slug: string): OrderableProduct | null {
  const entry = ORDERABLE[slug];
  if (!entry) return null;
  const product = PRODUCTS[slug];
  if (!product || product.fromPrice !== entry.unitPriceExclVat) return null;
  return entry;
}

/** Translation namespace of the product page, used for the add-on labels. */
export function productNamespace(slug: string): string {
  return PRODUCTS[slug]?.namespace ?? '';
}
