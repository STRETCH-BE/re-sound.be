'use client';

import SoundboothProductPage from './SoundboothProductPage';

/**
 * Solo Flex — single-person STRETCH soundbooth.
 * Adapts the supplier (Box 1 Flex) into STRETCH white-label branding.
 */
export default function SoloFlexProductPage() {
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
        { iconKey: '🌬️', key: 'ventilation' },
        { iconKey: '🔌', key: 'electrics' },
        { iconKey: '💡', key: 'lighting' },
        { iconKey: '🪑', key: 'comfort' },
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
        { id: 'sitStandDesk',    image: '/images/products/solo-flex/addon-desk.jpg' },
        { id: 'monitorMount',    image: '/images/products/solo-flex/addon-monitor.jpg' },
        { id: 'cableManagement', image: '/images/products/solo-flex/addon-cable.jpg' },
        { id: 'shelf',           image: '/images/products/solo-flex/addon-shelf.jpg' },
        { id: 'extraFan',        image: '/images/products/solo-flex/addon-fan.jpg' },
        { id: 'fabricPanel',     image: '/images/products/solo-flex/addon-fabric.jpg' },
      ]}
      downloads={[
        { id: 'datasheet',  labelKey: 'downloads.productDataSheet',    icon: '📄', file: '/documents/solo-flex/product-data-sheet.pdf' },
        { id: 'manual',     labelKey: 'downloads.installationManual',  icon: '📋', file: '/documents/solo-flex/installation-manual.pdf' },
        { id: 'acoustic',   labelKey: 'downloads.acousticTestReport',  icon: '📊', file: '/documents/solo-flex/acoustic-test-report.pdf' },
        { id: 'cad',        labelKey: 'downloads.cadDrawing',          icon: '📐', file: '/documents/solo-flex/cad-drawing.dwg' },
        { id: 'warranty',   labelKey: 'downloads.warranty',            icon: '🛡️', file: '/documents/solo-flex/warranty.pdf' },
        { id: 'sustain',    labelKey: 'downloads.sustainability',      icon: '♻️', file: '/documents/solo-flex/sustainability.pdf' },
      ]}
      crossLinks={[
        { slug: 'duo',        href: '/products/duo' },
        { slug: 'modular-xl', href: '/products/modular-xl' },
      ]}
    />
  );
}
