/**
 * Company-level facts — the single source of truth for copy, JSON-LD, the
 * footer and the About page.
 *
 * Anything typed `| null` and annotated `TODO(needs-Michael)` is a
 * placeholder: the value was missing or contradictory on the live site and
 * must be confirmed before it is published. Every consumer of a placeholder
 * hides the fact instead of guessing (no year in JSON-LD, no "Made in …"
 * badge, no price) — see docs/seo-sprint-report.md for the full list.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://re-sound.be'
).replace(/\/$/, '');

export const BRAND = 'Re-Sound';
export const LEGAL_NAME = 'STRETCH-BE BV';

/** The group Re-Sound belongs to (used for Organization.parentOrganization). */
export const PARENT_ORGANIZATION = {
  name: 'STRETCH Group',
  url: 'https://stretchgroup.be',
} as const;

/**
 * TODO(needs-Michael): the About page said "founded in 2021", the
 * Organization JSON-LD said "2024". Set the real year here; while it is
 * null the year is omitted from JSON-LD and from the About page copy.
 */
export const FOUNDING_YEAR: number | null = null;

/**
 * Social profiles. The footer values are kept (they were the ones users
 * actually clicked); the old JSON-LD used linkedin.com/company/re-sound-be.
 * TODO(needs-Michael): confirm the LinkedIn slug (resoundbe vs re-sound-be).
 */
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/resoundbe',
  facebook: 'https://www.facebook.com/resoundbe',
  linkedin: 'https://www.linkedin.com/company/resoundbe',
  youtube: 'https://www.youtube.com/@re-soundbe',
} as const;

export const SOCIAL_LINKS_LIST: string[] = Object.values(SOCIAL_LINKS);

/** ISO 3166-1 alpha-2 codes of the countries Re-Sound manufactures in. */
export type PlantCountry = 'BE' | 'PL';

/** Own production plants — feeds the manufacturer statement everywhere. */
export const PLANTS: ReadonlyArray<{ city: string; country: PlantCountry }> = [
  { city: 'Beveren-Waas', country: 'BE' },
  { city: 'Częstochowa', country: 'PL' },
];

/** Head office + showroom (LocalBusiness node, footer, contact pages). */
export const SHOWROOM = {
  name: 'Re-Sound Showroom Beveren-Waas',
  streetAddress: 'Gentseweg 309 A3',
  postalCode: '9120',
  addressLocality: 'Beveren-Waas',
  addressRegion: 'Oost-Vlaanderen',
  addressCountry: 'BE',
  latitude: 51.1953188,
  longitude: 4.2239015,
  telephone: '+32-3-284-68-18',
  telephoneHref: 'tel:+3232846818',
  email: 'info@re-sound.be',
  openingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  opens: '09:00',
  closes: '17:00',
  priceRange: '€€',
} as const;

export interface Partner {
  name: string;
  /** e.g. 'Material supplier', 'Research partner' */
  type: string;
  url?: string;
  logo?: string;
}

/**
 * TODO(needs-Michael): real partner entries. The About page previously showed
 * "Partner 1 … Partner 4" placeholders; the block is hidden while this list
 * is empty and renders automatically once entries are added.
 */
export const PARTNERS: Partner[] = [];

/**
 * Prices that are still placeholders (see src/data/products.ts) are only
 * emitted in JSON-LD / shown in comparison tables when this flag is set, so
 * nothing false ships by accident. Confirmed prices always ship.
 *   NEXT_PUBLIC_SHOW_PRICES=true
 */
export const SHOW_PLACEHOLDER_PRICES =
  process.env.NEXT_PUBLIC_SHOW_PRICES === 'true' ||
  process.env.NEXT_PUBLIC_SHOW_PRICES === '1';
