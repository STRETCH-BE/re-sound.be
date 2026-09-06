/**
 * VAT rules for Re-Sound orders.
 *
 * Every booth and panel ships from the Re-Sound plant in Częstochowa
 * (Poland), so Poland is the country of departure and Polish VAT law
 * decides the rate:
 *
 *   - delivery inside Poland                       → 23 % Polish VAT
 *   - delivery in another EU country, business
 *     with a valid EU VAT number                   → 0 %, reverse charge
 *     (intra-Community supply, Art. 138 / 196 of the EU VAT Directive)
 *   - delivery in another EU country, private
 *     buyer or business without a valid number     → 23 % Polish VAT
 *   - delivery outside the EU                      → 0 %, export
 *
 * The rate is only ever computed on the server (src/app/api/order/route.ts);
 * the same functions run in the browser so the buyer sees the same number
 * while filling in the form.
 *
 * TODO(needs-Michael): confirm with the accountant how cross-border sales to
 * private buyers should be treated once the EU one-stop-shop (OSS) threshold
 * is passed — OSS charges the rate of the delivery country instead of the
 * 23 % implemented here (docs/needs-michael.md).
 */

/** Country of departure: the Częstochowa plant. */
export const SHIP_FROM_COUNTRY = 'PL';

/** Polish standard VAT rate. */
export const DOMESTIC_VAT_RATE = 0.23;

export interface Country {
  /** ISO 3166-1 alpha-2 (XI = Northern Ireland, which stays in the EU VAT area for goods) */
  code: string;
  /** English name — fallback when Intl.DisplayNames is unavailable */
  name: string;
  /** Inside the EU VAT area for goods */
  eu: boolean;
}

/**
 * Delivery countries offered in the order form: the EU VAT area plus the
 * European countries Re-Sound delivers to. Names are localised in the browser
 * with Intl.DisplayNames; `name` is the fallback.
 */
export const COUNTRIES: Country[] = [
  { code: 'AT', name: 'Austria', eu: true },
  { code: 'BE', name: 'Belgium', eu: true },
  { code: 'BG', name: 'Bulgaria', eu: true },
  { code: 'HR', name: 'Croatia', eu: true },
  { code: 'CY', name: 'Cyprus', eu: true },
  { code: 'CZ', name: 'Czechia', eu: true },
  { code: 'DK', name: 'Denmark', eu: true },
  { code: 'EE', name: 'Estonia', eu: true },
  { code: 'FI', name: 'Finland', eu: true },
  { code: 'FR', name: 'France', eu: true },
  { code: 'DE', name: 'Germany', eu: true },
  { code: 'GR', name: 'Greece', eu: true },
  { code: 'HU', name: 'Hungary', eu: true },
  { code: 'IE', name: 'Ireland', eu: true },
  { code: 'IT', name: 'Italy', eu: true },
  { code: 'LV', name: 'Latvia', eu: true },
  { code: 'LT', name: 'Lithuania', eu: true },
  { code: 'LU', name: 'Luxembourg', eu: true },
  { code: 'MT', name: 'Malta', eu: true },
  { code: 'NL', name: 'Netherlands', eu: true },
  { code: 'PL', name: 'Poland', eu: true },
  { code: 'PT', name: 'Portugal', eu: true },
  { code: 'RO', name: 'Romania', eu: true },
  { code: 'SK', name: 'Slovakia', eu: true },
  { code: 'SI', name: 'Slovenia', eu: true },
  { code: 'ES', name: 'Spain', eu: true },
  { code: 'SE', name: 'Sweden', eu: true },
  { code: 'XI', name: 'Northern Ireland', eu: true },
  { code: 'GB', name: 'United Kingdom', eu: false },
  { code: 'CH', name: 'Switzerland', eu: false },
  { code: 'NO', name: 'Norway', eu: false },
  { code: 'IS', name: 'Iceland', eu: false },
  { code: 'LI', name: 'Liechtenstein', eu: false },
  { code: 'RS', name: 'Serbia', eu: false },
  { code: 'UA', name: 'Ukraine', eu: false },
  { code: 'OTHER', name: 'Another country', eu: false },
];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function findCountry(code: string): Country | undefined {
  return BY_CODE.get(code.toUpperCase());
}

export function isEuCountry(code: string): boolean {
  return findCountry(code)?.eu ?? false;
}

/**
 * Per-country VAT number patterns (the country prefix is stripped first).
 * Format only — a well-formed number still has to exist in VIES, which the
 * server checks separately (src/lib/order/vies.ts).
 */
const VAT_PATTERNS: Record<string, RegExp> = {
  AT: /^U\d{8}$/,
  BE: /^[01]\d{9}$/,
  BG: /^\d{9,10}$/,
  CY: /^\d{8}[A-Z]$/,
  CZ: /^\d{8,10}$/,
  DE: /^\d{9}$/,
  DK: /^\d{8}$/,
  EE: /^\d{9}$/,
  ES: /^[A-Z]\d{7}[A-Z]$|^\d{8}[A-Z]$|^[A-Z]\d{8}$/,
  FI: /^\d{8}$/,
  FR: /^[A-Z0-9]{2}\d{9}$/,
  GR: /^\d{9}$/,
  HR: /^\d{11}$/,
  HU: /^\d{8}$/,
  IE: /^\d{7}[A-Z]{1,2}$|^\d[A-Z0-9+*]\d{5}[A-Z]$/,
  IT: /^\d{11}$/,
  LT: /^\d{9}$|^\d{12}$/,
  LU: /^\d{8}$/,
  LV: /^\d{11}$/,
  MT: /^\d{8}$/,
  NL: /^\d{9}B\d{2}$/,
  PL: /^\d{10}$/,
  PT: /^\d{9}$/,
  RO: /^\d{2,10}$/,
  SE: /^\d{12}$/,
  SI: /^\d{8}$/,
  SK: /^\d{10}$/,
  XI: /^\d{9}$|^\d{12}$|^(GD|HA)\d{3}$/,
};

/** Uppercase, strip spaces, dots and dashes. */
export function normaliseVatNumber(input: string): string {
  return input.toUpperCase().replace(/[\s.\-_/]/g, '');
}

/**
 * Split a VAT number into its country prefix and body. Greece is registered
 * as "EL" in VIES but "GR" as a country code; both are accepted.
 */
export function splitVatNumber(input: string): { country: string; body: string } | null {
  const value = normaliseVatNumber(input);
  const match = /^([A-Z]{2})(.+)$/.exec(value);
  if (!match) return null;
  const country = match[1] === 'EL' ? 'GR' : match[1];
  return { country, body: match[2] };
}

/** True when the number is well-formed for its own country. */
export function isVatNumberFormatValid(input: string): boolean {
  const parts = splitVatNumber(input);
  if (!parts) return false;
  const pattern = VAT_PATTERNS[parts.country];
  return pattern ? pattern.test(parts.body) : false;
}

/** VIES expects "EL" for Greece. */
export function viesCountryCode(country: string): string {
  return country === 'GR' ? 'EL' : country;
}

export type VatMode = 'domestic' | 'reverse-charge' | 'export';

export interface VatResult {
  rate: number;
  mode: VatMode;
}

export interface VatInput {
  /** 'company' unlocks the reverse charge; 'private' always pays Polish VAT inside the EU */
  customerType: 'company' | 'private';
  /** ISO code of the delivery address */
  deliveryCountry: string;
  /** VAT number accepted (format, and VIES when the check could run) */
  vatNumberValid: boolean;
  /** VAT number's own country — the reverse charge needs it to match the delivery country */
  vatNumberCountry?: string | null;
}

/**
 * The rate and the reason for it. A business outside Poland only gets the
 * reverse charge when its VAT number is valid and issued by the country the
 * goods are delivered to; anything else stays taxable in Poland.
 */
export function resolveVat({
  customerType,
  deliveryCountry,
  vatNumberValid,
  vatNumberCountry,
}: VatInput): VatResult {
  const country = deliveryCountry.toUpperCase();

  // Departure country: always Polish VAT.
  if (country === SHIP_FROM_COUNTRY) return { rate: DOMESTIC_VAT_RATE, mode: 'domestic' };

  // Outside the EU: export, no Polish VAT (import duties are the buyer's).
  if (!isEuCountry(country)) return { rate: 0, mode: 'export' };

  const numberMatchesDelivery =
    !vatNumberCountry || vatNumberCountry.toUpperCase() === country;

  if (customerType === 'company' && vatNumberValid && numberMatchesDelivery) {
    return { rate: 0, mode: 'reverse-charge' };
  }

  return { rate: DOMESTIC_VAT_RATE, mode: 'domestic' };
}
