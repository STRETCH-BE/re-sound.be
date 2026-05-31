'use client';

import SoundboothProductPage from './SoundboothProductPage';

/**
 * Modular XL — meeting pod with modular extension.
 * Base seats up to 6; each +90cm segment adds capacity up to 10 people.
 * White-label adaptation of the supplier (Box XL), Re-Sound branded.
 */
export default function ModularXLProductPage() {
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
        { iconKey: '📈', key: 'modular' },
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
        { titleKey: 'extensionTitle', rows: [
          { label: 'segmentSize', value: 'segmentSizeValue' },
          { label: 'segmentWeight', value: 'segmentWeightValue' },
          { label: 'segmentFans', value: 'segmentFansValue' },
          { label: 'segmentPower', value: 'segmentPowerValue' },
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
        { titleKey: 'clearancesTitle', rows: [
          { label: 'ceilingHeight', value: 'ceilingValue' },
          { label: 'sideClearance', value: 'sideValue' },
          { label: 'frontClearance', value: 'frontValue' },
        ]},
        { titleKey: 'warrantyTitle', rows: [
          { label: 'structural', value: 'structuralValue' },
          { label: 'electronics', value: 'electronicsValue' },
          { label: 'delivery', value: 'deliveryValue' },
        ]},
      ]}
      addons={[
        { id: 'meetingTable',    image: '/images/products/modular-xl/addon-table.jpg' },
        { id: 'displaySystem',   image: '/images/products/modular-xl/addon-display.jpg' },
        { id: 'videoConference', image: '/images/products/modular-xl/addon-video.jpg' },
        { id: 'cableManagement', image: '/images/products/modular-xl/addon-cable.jpg' },
        { id: 'whiteboard',      image: '/images/products/modular-xl/addon-whiteboard.jpg' },
        { id: 'fabricPanel',     image: '/images/products/modular-xl/addon-fabric.jpg' },
      ]}
      downloads={[
        { id: 'datasheet',  labelKey: 'downloads.productDataSheet',    icon: '📄', file: '/documents/modular-xl/product-data-sheet.pdf' },
        { id: 'manual',     labelKey: 'downloads.installationManual',  icon: '📋', file: '/documents/modular-xl/installation-manual.pdf' },
        { id: 'acoustic',   labelKey: 'downloads.acousticTestReport',  icon: '📊', file: '/documents/modular-xl/acoustic-test-report.pdf' },
        { id: 'cad',        labelKey: 'downloads.cadDrawing',          icon: '📐', file: '/documents/modular-xl/cad-drawing.dwg' },
        { id: 'warranty',   labelKey: 'downloads.warranty',            icon: '🛡️', file: '/documents/modular-xl/warranty.pdf' },
        { id: 'sustain',    labelKey: 'downloads.sustainability',      icon: '♻️', file: '/documents/modular-xl/sustainability.pdf' },
      ]}
      crossLinks={[
        { slug: 'solo-flex', href: '/products/solo-flex' },
        { slug: 'duo',       href: '/products/duo' },
      ]}
    />
  );
}
