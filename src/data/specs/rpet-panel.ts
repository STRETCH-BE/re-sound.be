/**
 * rPET Panel — specification tables.
 *
 * Transcribed from src/components/sections/rpetpanelpage.tsx,
 * the former <section id="specs"> (lines 758–902 of the pre-refactor file),
 * card by card and row by row, in the original order.
 *
 * Governed figures (thickness options, αw, class, fire class, recycled
 * content) come from src/data/products.ts via spec(); the OEKO-TEX row is
 * guarded by cert(). The absorption class is derived from the data αw — an
 * "up to" value gives none, so that row stays hidden. Removed: the German
 * fire class (no such data field) and "Recyclability" (no such data field).
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('rpetPanelPage.specs.dimensionsTitle'),
    rows: [
      { label: key('rpetPanelPage.specs.dimStandard'), value: '1,200 × 2,750 mm' },
      { label: key('rpetPanelPage.specs.dimCustomMax'), value: '3,000 × 2,000 mm' },
      { label: key('rpetPanelPage.specs.dimThicknessOptions'), value: spec('rpet-panel', 'thickness') },
      { label: key('rpetPanelPage.specs.dimCustomThickness'), value: 'Up to 40 mm' },
    ],
  },
  {
    title: key('rpetPanelPage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: spec('rpet-panel', 'alphaW') },
      { label: key('productPage.specs.absorptionClass'), value: spec('rpet-panel', 'absorptionClass') },
      { label: key('productPage.specs.testStandard'), value: 'ISO 354 / ISO 11654' },
    ],
  },
  {
    title: key('rpetPanelPage.specs.physicalTitle'),
    rows: [
      { label: key('rpetPanelPage.specs.physMaterial'), value: key('productData.specValues.pet100Polyester') },
      { label: key('productPage.specs.recycledContent'), value: spec('rpet-panel', 'recycledContentPct') },
      { label: key('rpetPanelPage.specs.physWeight12'), value: '3 kg/m²' },
      { label: key('rpetPanelPage.specs.physWeight24'), value: '4 kg/m²' },
    ],
  },
  {
    title: key('rpetPanelPage.specs.fireTitle'),
    rows: [
      { label: key('rpetPanelPage.specs.fireEuClass'), value: spec('rpet-panel', 'fireClass') },
      { label: key('productPage.specs.testStandard'), value: 'EN 13501-1' },
    ],
  },
  {
    title: key('rpetPanelPage.specs.healthTitle'),
    rows: [
      {
        label: key('rpetPanelPage.specs.healthOekoTex'),
        value: cert('rpet-panel', 'OEKO-TEX', 'productData.specValues.oekoStandard100Class1'),
      },
      { label: key('rpetPanelPage.specs.vocEmissions'), value: key('productData.specValues.classAPlusIso16000') },
      { label: key('rpetPanelPage.specs.healthFormaldehyde'), value: key('productData.specValues.none') },
      { label: key('rpetPanelPage.specs.healthBinders'), value: key('productData.specValues.none') },
    ],
  },
  {
    title: key('rpetPanelPage.specs.colorsTitle'),
    rows: [
      { label: key('rpetPanelPage.specs.colorStandard'), value: key('productData.specValues.fiveMidnightToFrost') },
      { label: key('rpetPanelPage.specs.colorCustom'), value: key('rpetPanelPage.specs.anyRalNcs') },
      { label: key('rpetPanelPage.specs.finishOptions'), value: key('rpetPanelPage.specs.finishOptionsVal') },
    ],
  },
];

export default specs;
