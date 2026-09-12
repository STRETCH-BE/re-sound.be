'use client';

import SoundboothProductPage, { type BoothSlots } from './SoundboothProductPage';

/**
 * Duo — two-person Re-Sound office phone booth / focus pod.
 * One shell; "Flex" config seats two for a meeting, "Work" config gives one
 * person a full-width desk. Specifications, downloads, FAQ and "other
 * models" arrive as server-rendered slots from the route page.
 */
export default function DuoProductPage(slots: BoothSlots) {
  return (
    <SoundboothProductPage
      slug="duo"
      namespace="duoPage"
      imageDir="/images/products/duo"
      heroImage="/images/products/duo/hero-flex.jpg"
      heroStats={[
        { value: '2 m²',  labelKey: 'hero.statFootprint' },
        { value: '420 kg', labelKey: 'hero.statWeight' },
        { value: '2', labelKey: 'hero.statConfigs' },
      ]}
      configurations={[
        { id: 'flex', image: '/images/products/duo/hero-flex.jpg' },
        { id: 'work', image: '/images/products/duo/hero-work.jpg' },
      ]}
      features={[
        { iconKey: 'switchable', key: 'switchable' },
        { iconKey: 'ventilation', key: 'ventilation' },
        { iconKey: 'electrics', key: 'electrics' },
        { iconKey: 'lighting', key: 'lighting' },
        { iconKey: 'accessibility', key: 'accessibility' },
        { iconKey: 'safety', key: 'safety' },
      ]}
      addons={[
        { id: 'electricDesk',    image: '/images/products/duo/addon-desk.jpg' },
        { id: 'monitorMount',    image: '/images/products/duo/addon-monitor.jpg' },
        { id: 'displaySystem',   image: '/images/products/duo/addon-display.jpg' },
        { id: 'cableManagement', image: '/images/products/duo/addon-cable.jpg' },
        { id: 'extraSeating',    image: '/images/products/duo/addon-seating.jpg' },
        { id: 'fabricPanel',     image: '/images/products/duo/addon-fabric.jpg' },
      ]}
      {...slots}
    />
  );
}
