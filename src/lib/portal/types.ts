// ============================================================================
// CLIENT PORTAL — shared types & constants
//
// The portal serves the STRETCH trade pricelist (and, later, more client data)
// behind a login. Data model mirrors the "PriceBook" sheet of the Alto Pricing
// System workbook — STRIPPED of every internal column (margin %, cost build-up
// etc.). Those never leave the Excel file: they are not parsed, not stored,
// not transmitted.
// ============================================================================

/** One product × market price row — the only pricing data the portal knows. */
export type PriceRow = {
  category: string;
  code: string | null;
  product: string;
  unit: string | null;
  /** Price group the row belongs to (market / tier / channel). */
  market: string;
  price_eur: number;
  price_pln: number | null;
  /** Optional visual grouping inside a category (brand for foils/ceilings). */
  product_group: string | null;
  /**
   * Occurrence number (1, 2, …) among rows sharing Category+Product+Market.
   * The Excel PriceBook contains same-named rows that are genuinely different
   * products (e.g. roll width bands) — seq keeps them apart in the database.
   */
  seq: number;
  /** Preserves the PriceBook row order for display. */
  sort: number;
};

export type PricebookMeta = {
  version: string;
  fx_eur_pln: number | null;
  source: string | null;
  updated_at: string;
};

export type PortalRole = 'client' | 'admin';

export type PortalProfile = {
  id: string;
  email: string;
  company: string | null;
  role: PortalRole;
  /** Price groups this account may see (ignored when allMarkets). */
  markets: string[];
  allMarkets: boolean;
  active: boolean;
};

export type PortalSession = {
  profile: PortalProfile;
  /** True when running without Supabase (zero-config preview mode). */
  demo: boolean;
};

/**
 * Every price group that exists in the PriceBook. A client account is granted
 * a subset of these (per-market pricing was an explicit business decision —
 * margins differ per market and clients must never see other markets).
 */
export const PRICE_MARKETS = [
  'East Europe',
  'West Europe',
  'USA',
  'UAE',
  'Key account',
  'Producers',
  'Standard',
  'Tier: Budget',
  'Tier: Mid',
  'Tier: Export',
] as const;

/** Category display order (matches the PriceBook / mockup ordering). */
export const CATEGORY_ORDER = [
  'Ceilings made-to-measure',
  'Rolls PVC foil',
  'Foil cut to length',
  'Profiles ALU/PVC',
  'Profile accessories',
  'Accessories PVC',
  'Tracklighting 48V',
] as const;

export function categoryRank(category: string): number {
  const i = (CATEGORY_ORDER as readonly string[]).indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

/** Result of syncing an uploaded PriceBook against the database. */
export type SyncReport = {
  total: number;
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
  skipped: string[];
  version: string;
  persisted: boolean;
};
