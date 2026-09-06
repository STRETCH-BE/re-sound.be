/**
 * Interior — specification tables.
 *
 * Transcribed from the former inline "Specifications" section of
 * src/components/sections/InteriorProductPage.tsx (lines 480–604 before the
 * refactor): six cards, seventeen rows, in the original order.
 *
 *   t('specs.x')      → key('interiorPage.specs.x')
 *   tPage('specs.x')  → key('productPage.specs.x')
 */
import type { SpecTableDef } from './types';
import { key } from './types';

const specs: SpecTableDef = [
  {
    title: key('productPage.specs.dimensions'),
    rows: [
      { label: key('productPage.specs.moduleSize'), value: key('interiorPage.specs.moduleSizeValue') },
      { label: key('productPage.specs.thickness'), value: key('interiorPage.specs.thicknessValue') },
      { label: key('productPage.specs.weight'), value: key('interiorPage.specs.weightValue') },
    ],
  },
  {
    title: key('interiorPage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: key('interiorPage.specs.alphaValue') },
      { label: key('productPage.specs.absorptionClass'), value: key('interiorPage.specs.classValue') },
      { label: key('productPage.specs.nrc'), value: key('interiorPage.specs.nrcValue') },
    ],
  },
  {
    title: key('interiorPage.specs.materialsTitle'),
    rows: [
      { label: key('productPage.specs.core'), value: key('interiorPage.specs.coreValue') },
      { label: key('productPage.specs.absorber'), value: key('interiorPage.specs.absorberValue') },
      { label: key('productPage.specs.cover'), value: key('interiorPage.specs.coverValue') },
    ],
  },
  {
    title: key('interiorPage.specs.fireTitle'),
    rows: [
      { label: key('productPage.specs.fireRating'), value: key('interiorPage.specs.fireRatingValue') },
      { label: key('productPage.specs.standard'), value: key('interiorPage.specs.fireStandardValue') },
    ],
  },
  {
    title: key('interiorPage.specs.sustainTitle'),
    rows: [
      { label: key('productPage.specs.recycledContent'), value: key('interiorPage.specs.recycledValue') },
      { label: key('productPage.specs.endOfLife'), value: key('interiorPage.specs.endOfLifeValue') },
      { label: key('productPage.specs.vocEmissions'), value: key('interiorPage.specs.vocValue') },
    ],
  },
  {
    title: key('interiorPage.specs.installTitle'),
    rows: [
      { label: key('productPage.specs.mounting'), value: key('interiorPage.specs.mountingValue') },
      { label: key('productPage.specs.installationTime'), value: key('interiorPage.specs.installTimeValue') },
      { label: key('productPage.specs.toolsRequired'), value: key('interiorPage.specs.toolsValue') },
    ],
  },
];

export default specs;
