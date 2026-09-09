'use client';

import SoundboothProductPage, { type BoothSlots } from './SoundboothProductPage';

/**
 * Solo ECO — the entry model of the Re-Sound booth range: one person, a
 * standing table, one colour scheme, closed or glass back wall. Facts come
 * from the 2026 price list (tech sheet + articles RS-SE-*). The list
 * publishes no ISO 23351-1 figure for this model, so the acoustics section
 * is not shown (docs/needs-michael.md). Specifications, downloads, FAQ and
 * "other models" arrive as server-rendered slots from the route page
 * (src/app/[locale]/products/solo-eco/page.tsx).
 *
 * Photos (public/images/products/solo-eco): supplied by Re-Sound on
 * 9 September 2026; hero = studio scene with the door open, overview = loft
 * scene, add-on = the stool at the standing table.
 */
export default function SoloEcoProductPage(slots: BoothSlots) {
  return (
    <SoundboothProductPage
      slug="solo-eco"
      namespace="soloEcoPage"
      imageDir="/images/products/solo-eco"
      heroImage="/images/products/solo-eco/hero.jpg"
      heroStats={[
        { value: '1.1 m²', labelKey: 'hero.statFootprint' },
        { value: '280 kg', labelKey: 'hero.statWeight' },
        { value: '5 yr', labelKey: 'hero.statWarranty' },
      ]}
      showAcoustics={false}
      features={[
        { iconKey: '🌬️', key: 'ventilation' },
        { iconKey: '🔌', key: 'electrics' },
        { iconKey: '🪟', key: 'glass' },
        { iconKey: '🧍', key: 'table' },
        { iconKey: '🧵', key: 'interior' },
        { iconKey: '🛡️', key: 'warranty' },
      ]}
      // The two list options (RS-SE-OCC stool, RS-SE-BG glass back wall); no page-only add-ons.
      // No photo of the glass back wall exists yet, so that card has no image.
      addons={[{ id: 'stool', image: '/images/products/solo-eco/addon-stool.jpg' }, { id: 'glassBackWall' }]}
      {...slots}
    />
  );
}
