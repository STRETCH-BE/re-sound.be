/**
 * Divide — specification tables.
 *
 * Transcribed from src/components/sections/DivideProductPage.tsx,
 * the former <section id="specs"> (lines 536–668 of the pre-refactor file),
 * card by card and row by row, in the original order.
 *
 * Governed figures (thickness, αw, class, fire class, recycled content) come
 * from src/data/products.ts via spec().
 */
import type { SpecTableDef } from './types';
import { key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('dividePage.specs.dimensionsTitle'),
    rows: [
      { label: key('dividePage.specs.moduleWidth'), value: '800 mm' },
      { label: key('dividePage.specs.moduleHeight'), value: '1600 mm' },
      { label: key('productPage.specs.thickness'), value: spec('divide', 'thickness') },
      { label: key('productPage.specs.weight'), value: key('productData.specValues.weightPerModule8') },
    ],
  },
  {
    title: key('dividePage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: spec('divide', 'alphaW') },
      { label: key('productPage.specs.absorptionClass'), value: spec('divide', 'absorptionClass') },
      { label: key('productData.specValues.dualSided'), value: key('productData.specValues.yes') },
    ],
  },
  {
    title: key('dividePage.specs.materialsTitle'),
    rows: [
      { label: key('productPage.specs.core'), value: key('productData.specValues.recycledTextileFiber') },
      { label: key('productPage.specs.cover'), value: key('dividePage.specs.fabricCore') },
      { label: key('productData.specValues.base'), value: key('dividePage.specs.steelFrame') },
      { label: key('dividePage.specs.magnets'), value: key('dividePage.specs.magnetsVal') },
    ],
  },
  {
    title: key('dividePage.specs.fireTitle'),
    rows: [
      { label: key('productPage.specs.fireRating'), value: spec('divide', 'fireClass') },
      { label: key('productPage.specs.standard'), value: 'EN 13501-1' },
    ],
  },
  {
    title: key('dividePage.specs.sustainTitle'),
    rows: [
      { label: key('productPage.specs.recycledContent'), value: spec('divide', 'recycledContentPct') },
      { label: key('dividePage.specs.endOfLife'), value: key('dividePage.specs.endOfLifeVal') },
      { label: key('productPage.specs.vocEmissions'), value: key('productData.specValues.lowAPlus') },
    ],
  },
  {
    title: key('dividePage.specs.featuresTitle'),
    rows: [
      { label: key('dividePage.specs.connection'), value: key('dividePage.specs.connectionVal') },
      { label: key('dividePage.specs.setupTime'), value: key('dividePage.specs.setupTimeVal') },
      { label: key('dividePage.specs.toolsRequired'), value: key('productData.specValues.none') },
    ],
  },
];

export default specs;
