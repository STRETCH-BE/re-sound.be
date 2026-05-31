'use client';

import SoundboothProductPage from './SoundboothProductPage';

/**
 * Duo — two-configuration Re-Sound soundbooth.
 * One shell; "Flex" config seats two for a meeting, "Work" config gives one
 * person a full-width desk. Adapts Box 2 Flex + Box 2 Work supplier pages
 * into a single white-label product page (same shell, switchable layout).
 */
export default function DuoProductPage() {
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
        { iconKey: '🔄', key: 'switchable' },
        { iconKey: '🌬️', key: 'ventilation' },
        { iconKey: '🔌', key: 'electrics' },
        { iconKey: '💡', key: 'lighting' },
        { iconKey: '♿', key: 'accessibility' },
        { iconKey: '🛡️', key: 'safety' },
      ]}
      specCards={[
        { titleKey: 'dimensionsTitle', rows: [
          { label: 'externalDim', value: 'externalDimValue' },
          { label: 'internalDim', value: 'internalDimValue' },
          { label: 'doorWidth',   value: 'doorWidthValue' },
          { label: 'weight',      value: 'weightValue' },
        ]},
        { titleKey: 'acousticsTitle', rows: [
          { label: 'noiseReduction', value: 'noiseReductionValue' },
          { label: 'absorberMaterial', value: 'absorberValue' },
          { label: 'doorSeal', value: 'doorSealValue' },
        ]},
        { titleKey: 'ventilationTitle', rows: [
          { label: 'airflow', value: 'airflowValue' },
          { label: 'fanCount', value: 'fanCountValue' },
          { label: 'occupancySensor', value: 'occupancyValue' },
        ]},
        { titleKey: 'electricsTitle', rows: [
          { label: 'powerSockets', value: 'powerValue' },
          { label: 'usb', value: 'usbValue' },
          { label: 'lighting', value: 'lightingValue' },
          { label: 'totalConsumption', value: 'consumptionValue' },
        ]},
        { titleKey: 'materialsTitle', rows: [
          { label: 'frame', value: 'frameValue' },
          { label: 'glass', value: 'glassValue' },
          { label: 'interior', value: 'interiorValue' },
          { label: 'floor', value: 'floorValue' },
        ]},
        { titleKey: 'warrantyTitle', rows: [
          { label: 'structural', value: 'structuralValue' },
          { label: 'electronics', value: 'electronicsValue' },
          { label: 'delivery', value: 'deliveryValue' },
        ]},
      ]}
      addons={[
        { id: 'electricDesk',    image: '/images/products/duo/addon-desk.jpg' },
        { id: 'monitorMount',    image: '/images/products/duo/addon-monitor.jpg' },
        { id: 'displaySystem',   image: '/images/products/duo/addon-display.jpg' },
        { id: 'cableManagement', image: '/images/products/duo/addon-cable.jpg' },
        { id: 'extraSeating',    image: '/images/products/duo/addon-seating.jpg' },
        { id: 'fabricPanel',     image: '/images/products/duo/addon-fabric.jpg' },
      ]}
      downloads={[
        { id: 'datasheet',  labelKey: 'downloads.productDataSheet',    icon: '📄', file: '/documents/duo/product-data-sheet.pdf' },
        { id: 'manual',     labelKey: 'downloads.installationManual',  icon: '📋', file: '/documents/duo/installation-manual.pdf' },
        { id: 'acoustic',   labelKey: 'downloads.acousticTestReport',  icon: '📊', file: '/documents/duo/acoustic-test-report.pdf' },
        { id: 'cad',        labelKey: 'downloads.cadDrawing',          icon: '📐', file: '/documents/duo/cad-drawing.dwg' },
        { id: 'warranty',   labelKey: 'downloads.warranty',            icon: '🛡️', file: '/documents/duo/warranty.pdf' },
        { id: 'sustain',    labelKey: 'downloads.sustainability',      icon: '♻️', file: '/documents/duo/sustainability.pdf' },
      ]}
      crossLinks={[
        { slug: 'solo-flex',  href: '/products/solo-flex' },
        { slug: 'modular-xl', href: '/products/modular-xl' },
      ]}
    />
  );
}
