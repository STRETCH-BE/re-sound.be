'use client';

import SoundboothProductPage, { type BoothSlots } from './SoundboothProductPage';

/**
 * Modular XL — acoustic meeting pod with modular extension.
 * Base seats up to 6; each +90 cm segment adds capacity up to 10 people.
 * Specifications, downloads, FAQ and "other models" arrive as server-rendered
 * slots from the route page.
 */
export default function ModularXLProductPage(slots: BoothSlots) {
  return (
    <SoundboothProductPage
      slug="modular-xl"
      namespace="modularXlPage"
      imageDir="/images/products/modular-xl"
      heroImage="/images/products/modular-xl/hero.jpg"
      heroStats={[
        { value: '4.3 m²', labelKey: 'hero.statFootprint' },
        { value: '790 kg', labelKey: 'hero.statWeight' },
        { value: '10 max', labelKey: 'hero.statCapacity' },
      ]}
      showGrowthDiagram
      features={[
        { iconKey: 'modular', key: 'modular' },
        { iconKey: 'ventilation', key: 'ventilation' },
        { iconKey: 'electrics', key: 'electrics' },
        { iconKey: 'lighting', key: 'lighting' },
        { iconKey: 'accessibility', key: 'accessibility' },
        { iconKey: 'safety', key: 'safety' },
      ]}
      addons={[
        { id: 'meetingTable',    image: '/images/products/modular-xl/addon-table.jpg' },
        { id: 'displaySystem',   image: '/images/products/modular-xl/addon-display.jpg' },
        { id: 'videoConference', image: '/images/products/modular-xl/addon-video.jpg' },
        { id: 'cableManagement', image: '/images/products/modular-xl/addon-cable.jpg' },
        { id: 'whiteboard',      image: '/images/products/modular-xl/addon-whiteboard.jpg' },
        { id: 'fabricPanel',     image: '/images/products/modular-xl/addon-fabric.jpg' },
      ]}
      {...slots}
    />
  );
}
