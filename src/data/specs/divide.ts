/**
 * Divide — specification tables.
 *
 * Transcribed from src/components/sections/DivideProductPage.tsx,
 * the former <section id="specs"> (lines 536–668 of the pre-refactor file),
 * card by card and row by row, in the original order.
 */
import type { SpecTableDef } from './types';
import { key } from './types';

const specs: SpecTableDef = [
  {
    title: key('dividePage.specs.dimensionsTitle'),
    rows: [
      { label: key('dividePage.specs.moduleWidth'), value: '800 mm' },
      { label: key('dividePage.specs.moduleHeight'), value: '1600 mm' },
      { label: key('productPage.specs.thickness'), value: '45 mm' },
      { label: key('productPage.specs.weight'), value: '~8 kg per module' },
    ],
  },
  {
    title: key('dividePage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: '0.85' },
      { label: key('productPage.specs.absorptionClass'), value: key('productPage.acoustics.classA') },
      { label: 'Dual-sided', value: 'Yes' },
    ],
  },
  {
    title: key('dividePage.specs.materialsTitle'),
    rows: [
      { label: key('productPage.specs.core'), value: 'Recycled textile fiber' },
      { label: key('productPage.specs.cover'), value: key('dividePage.specs.fabricCore') },
      { label: 'Base', value: key('dividePage.specs.steelFrame') },
      { label: key('dividePage.specs.magnets'), value: key('dividePage.specs.magnetsVal') },
    ],
  },
  {
    title: key('dividePage.specs.fireTitle'),
    rows: [
      { label: key('productPage.specs.fireRating'), value: 'B-s1, d0' },
      { label: key('productPage.specs.standard'), value: 'EN 13501-1' },
    ],
  },
  {
    title: key('dividePage.specs.sustainTitle'),
    rows: [
      { label: key('productPage.specs.recycledContent'), value: '≥80%' },
      { label: key('dividePage.specs.endOfLife'), value: key('dividePage.specs.endOfLifeVal') },
      { label: key('productPage.specs.vocEmissions'), value: 'Low / A+' },
    ],
  },
  {
    title: key('dividePage.specs.featuresTitle'),
    rows: [
      { label: key('dividePage.specs.connection'), value: key('dividePage.specs.connectionVal') },
      { label: key('dividePage.specs.setupTime'), value: key('dividePage.specs.setupTimeVal') },
      { label: key('dividePage.specs.toolsRequired'), value: 'None' },
    ],
  },
];

export default specs;
