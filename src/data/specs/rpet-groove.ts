/**
 * rPET Groove — specification tables.
 *
 * Transcribed from src/components/sections/rpetgroovepage.tsx,
 * the former <section id="specs"> (lines 780–937 of the pre-refactor file),
 * card by card and row by row, in the original order.
 *
 * Governed figures come from src/data/products.ts via spec(): the three
 * per-thickness NRC rows became one row showing the stored per-thickness
 * string (same order as the thickness row); the fire class is the EN 13501-1
 * value. The OEKO-TEX row is guarded by cert(); the recycled-content row is
 * data-backed and stays hidden while the data value is null. Removed: the US
 * / UK / DE fire classes (no such data fields), "EPD available" (not held)
 * and the "Post-consumer PET bottles" text that sat under "Recycled content".
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('rpetGroovePage.specs.dimensionsTitle'),
    rows: [
      { label: key('productPage.specs.dimPanelWidth'), value: '600 / 1200 mm' },
      { label: key('rpetGroovePage.specs.dimPanelLength'), value: '600 / 1200 / 2400 mm' },
      { label: key('productPage.specLabels.thickness'), value: spec('rpet-groove', 'thickness') },
      { label: key('rpetGroovePage.specs.dimGrooveDepth'), value: '6 / 12 / 18 mm' },
      { label: key('productPage.specLabels.weight'), value: '2.5 - 7.5 kg/m²' },
    ],
  },
  {
    title: key('rpetGroovePage.specs.acousticsTitle'),
    rows: [
      { label: key('rpetGroovePage.specs.nrcByThickness'), value: spec('rpet-groove', 'nrc') },
      { label: key('productPage.specLabels.testStandard'), value: 'ISO 354 / ASTM C423' },
    ],
  },
  {
    title: key('rpetGroovePage.specs.materialTitle'),
    rows: [
      { label: key('rpetGroovePage.specs.matComposition'), value: key('rpetGroovePage.specs.matRecycledPET') },
      { label: key('rpetGroovePage.specs.matDensity'), value: '200-250 kg/m³' },
      { label: key('rpetGroovePage.specs.colorsLabel'), value: key('rpetGroovePage.specs.colorsVal') },
      { label: key('rpetGroovePage.specs.customColors'), value: key('rpetGroovePage.specs.customColorsVal') },
    ],
  },
  {
    title: key('rpetGroovePage.specs.fireTitle'),
    rows: [
      { label: key('productPage.specs.fireRating'), value: spec('rpet-groove', 'fireClass') },
      { label: key('productPage.specLabels.testStandard'), value: 'EN 13501-1' },
    ],
  },
  {
    title: key('rpetGroovePage.specs.certsTitle'),
    rows: [
      {
        label: key('rpetGroovePage.specs.certHealth'),
        value: cert('rpet-groove', 'OEKO-TEX', 'productPage.specs.oekoTexStandard100'),
      },
      { label: key('rpetGroovePage.specs.matEmissions'), value: key('rpetGroovePage.specs.certVOC') },
      { label: key('productPage.specs.recycledContent'), value: spec('rpet-groove', 'recycledContentPct') },
    ],
  },
  {
    title: key('rpetGroovePage.specs.applicationsTitle'),
    rows: [
      { label: key('rpetGroovePage.specs.appInstall'), value: key('productPage.specLabels.wallsCeilings') },
      { label: key('rpetGroovePage.specs.appEnvironment'), value: key('productPage.specLabels.envVal') },
      { label: key('rpetGroovePage.specs.appIdealFor'), value: key('rpetGroovePage.specs.appIdealVal') },
      { label: key('rpetGroovePage.specs.appAlso'), value: key('rpetGroovePage.specs.appAlsoVal') },
    ],
  },
];

export default specs;
