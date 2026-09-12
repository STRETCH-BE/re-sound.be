/**
 * Solid — specification tables.
 *
 * Transcribed from src/components/sections/SolidProductPage.tsx,
 * the former <section id="specs"> (lines 496–620 of the pre-refactor file),
 * card by card and row by row, in the original order.
 *
 * Governed figures (thickness, αw, class, NRC, fire class, recycled content)
 * come from src/data/products.ts via spec().
 */
import type { SpecTableDef } from './types';
import { key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('productPage.specs.dimensions'),
    rows: [
      { label: key('productPage.specs.panelSize'), value: key('solidPage.specs.panelSizeValue') },
      { label: key('productPage.specs.thickness'), value: spec('solid', 'thickness') },
      { label: key('productPage.specs.weight'), value: key('productData.specValues.weightPerPanel5') },
    ],
  },
  {
    title: key('solidPage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: spec('solid', 'alphaW') },
      { label: key('productPage.specs.absorptionClass'), value: spec('solid', 'absorptionClass') },
      { label: key('productPage.specs.nrc'), value: spec('solid', 'nrc') },
    ],
  },
  {
    title: key('solidPage.specs.materialsTitle'),
    rows: [
      { label: key('productPage.specs.core'), value: key('solidPage.specs.coreValue') },
      { label: key('solidPage.specs.binderRow'), value: key('solidPage.specs.binderValue') },
      { label: key('productPage.specs.cover'), value: key('solidPage.specs.coverValue2') },
    ],
  },
  {
    title: key('solidPage.specs.fireTitle'),
    rows: [
      { label: key('productPage.specs.fireRating'), value: spec('solid', 'fireClass') },
      { label: key('productPage.specs.standard'), value: 'EN 13501-1' },
    ],
  },
  {
    title: key('solidPage.specs.sustainTitle'),
    rows: [
      { label: key('productPage.specs.recycledContent'), value: spec('solid', 'recycledContentPct') },
      { label: key('solidPage.specs.endOfLife'), value: key('solidPage.specs.endOfLifeVal') },
      { label: key('productPage.specs.vocEmissions'), value: key('productData.specValues.lowAPlus') },
    ],
  },
  {
    title: key('solidPage.specs.installTitle'),
    rows: [
      { label: key('solidPage.specs.mounting'), value: key('solidPage.specs.mountingVal') },
      { label: key('solidPage.specs.installTime'), value: key('solidPage.specs.installTimeVal') },
      { label: key('solidPage.specs.toolsRequired'), value: key('solidPage.specs.toolsVal') },
    ],
  },
];

export default specs;
