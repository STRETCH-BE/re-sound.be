/**
 * Range hub pages ("PET acoustic panels", "Wood acoustic panels",
 * "Acoustic phone booths").
 *
 * Each hub has an internal route (the English slug, which is also the
 * file-system route under src/app/[locale]/products/) and a localised
 * external slug per SEO locale. next-intl's `pathnames` (see
 * src/i18n/config.ts) rewrites the localised URL to the internal route;
 * locales without a mapping fall back to the English slug.
 */
import { SEO_LOCALES, locales, type Locale } from '@/i18n/config';
import type { ProductFamily } from './products';

export type HubId = 'rpet' | 'rwood' | 'booths';

export interface Hub {
  id: HubId;
  family: ProductFamily;
  /** Internal (file-system) route, e.g. '/products/pet-acoustic-panels' */
  internalPath: string;
  /** Localised slug per locale; missing locales fall back to `en` */
  slugs: Partial<Record<Locale, string>> & { en: string };
  /** Product slugs shown on the hub, in order */
  models: string[];
  /** Message namespace under `hubs.<id>` */
  namespace: string;
  /** Last content update (ISO date) for the sitemap */
  updatedAt: string;
}

export const HUBS: Record<HubId, Hub> = {
  rpet: {
    id: 'rpet',
    family: 'rpet',
    internalPath: '/products/pet-acoustic-panels',
    slugs: {
      en: 'pet-acoustic-panels',
      nl: 'pet-akoestische-panelen',
      fr: 'panneaux-acoustiques-pet',
      de: 'pet-akustikpaneele',
    },
    models: ['rpet-panel', 'rpet-groove', 'rpet-flex-groove'],
    namespace: 'hubs.rpet',
    updatedAt: '2026-09-06',
  },
  rwood: {
    id: 'rwood',
    family: 'rwood',
    internalPath: '/products/wood-acoustic-panels',
    slugs: {
      en: 'wood-acoustic-panels',
      nl: 'houten-akoestische-panelen',
      fr: 'panneaux-acoustiques-bois',
      de: 'holz-akustikpaneele',
    },
    models: ['rwood-groove', 'rwood-micro', 'rwood-perf', 'rwood-veneer'],
    namespace: 'hubs.rwood',
    updatedAt: '2026-09-06',
  },
  booths: {
    id: 'booths',
    family: 'booth',
    internalPath: '/products/acoustic-phone-booths',
    slugs: {
      en: 'acoustic-phone-booths',
      nl: 'akoestische-belcabines',
      fr: 'cabines-acoustiques',
      de: 'telefonboxen',
    },
    models: ['solo-eco', 'solo-flex', 'duo', 'modular-xl'],
    namespace: 'hubs.booths',
    updatedAt: '2026-09-08',
  },
};

export const HUB_IDS = Object.keys(HUBS) as HubId[];

/** Localised external path of a hub, e.g. '/products/pet-akoestische-panelen' for nl. */
export function hubPath(hub: Hub | HubId, locale: string): string {
  const h = typeof hub === 'string' ? HUBS[hub] : hub;
  const slug = h.slugs[locale as Locale] ?? h.slugs.en;
  return `/products/${slug}`;
}

/** The hub a product family belongs to (textile has no hub). */
export function hubForFamily(family: ProductFamily): Hub | null {
  return HUB_IDS.map((id) => HUBS[id]).find((h) => h.family === family) ?? null;
}

/**
 * next-intl `pathnames` map: internal route → external path per locale.
 * Every locale must be present, so non-SEO locales get the English slug.
 */
export function hubPathnames(): Record<string, Record<Locale, string>> {
  const out: Record<string, Record<Locale, string>> = {};
  for (const id of HUB_IDS) {
    const h = HUBS[id];
    out[h.internalPath] = Object.fromEntries(
      locales.map((loc) => [loc, hubPath(h, loc)])
    ) as Record<Locale, string>;
  }
  return out;
}

/** Locales that get their own hreflang entry for a hub (all SEO locales). */
export const HUB_SEO_LOCALES = SEO_LOCALES;
