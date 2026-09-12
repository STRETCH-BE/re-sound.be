'use client';

import SoundboothProductPage, { type BoothSlots } from './SoundboothProductPage';

/**
 * Solo Flex — one-person Re-Sound office phone booth.
 * Specifications, downloads, FAQ and "other models" arrive as server-rendered
 * slots from the route page (src/app/[locale]/products/solo-flex/page.tsx).
 */
export default function SoloFlexProductPage(slots: BoothSlots) {
  return (
    <SoundboothProductPage
      slug="solo-flex"
      namespace="soloFlexPage"
      imageDir="/images/products/solo-flex"
      heroImage="/images/products/solo-flex/hero.jpg"
      heroStats={[
        { value: '1 m²', labelKey: 'hero.statFootprint' },
        { value: '280 kg', labelKey: 'hero.statWeight' },
        { value: '5 yr', labelKey: 'hero.statWarranty' },
      ]}
      features={[
        { iconKey: 'ventilation', key: 'ventilation' },
        { iconKey: 'electrics', key: 'electrics' },
        { iconKey: 'lighting', key: 'lighting' },
        { iconKey: 'comfort', key: 'comfort' },
        { iconKey: 'accessibility', key: 'accessibility' },
        { iconKey: 'safety', key: 'safety' },
      ]}
      addons={[
        { id: 'sitStandDesk',    image: '/images/products/solo-flex/addon-desk.jpg' },
        { id: 'monitorMount',    image: '/images/products/solo-flex/addon-monitor.jpg' },
        { id: 'cableManagement', image: '/images/products/solo-flex/addon-cable.jpg' },
        { id: 'shelf',           image: '/images/products/solo-flex/addon-shelf.jpg' },
        { id: 'extraFan',        image: '/images/products/solo-flex/addon-fan.jpg' },
        { id: 'fabricPanel',     image: '/images/products/solo-flex/addon-fabric.jpg' },
      ]}
      {...slots}
    />
  );
}
