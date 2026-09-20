/**
 * rPET Groove — specification tables.
 *
 * rPET Groove is machined from the rPET Panel (Michael, 20 September 2026),
 * so material, density, colours, reaction to fire and end of life follow the
 * rPET Panel datasheet (EN · 09/2026, v1.0). Panel width and length, groove
 * depth, weight per m², thickness (12 / 24 / 36 mm), NRC per thickness and
 * the test standard are the earlier product data — the datasheet has no
 * Groove page; they are listed as open questions in the panel report.
 *
 * Governed figures come from src/data/products.ts via spec(): the three
 * per-thickness NRC values are one row showing the stored per-thickness
 * string (same order as the thickness row); the fire class is the stored
 * by-colour EN 13501-1 value. The OEKO-TEX row is guarded by cert(); the
 * recycled-content row is data-backed and stays hidden while null.
 * Removed: the US / UK / DE fire classes, "EPD available", the "Low
 * emission / E1" row (none is on the datasheet).
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('rpetGroovePage.specs.dimensionsTitle'),
    rows: [
      { label: key('productPage.specs.dimPanelWidth'), value: '600 / 1 200 mm' },
      { label: key('rpetGroovePage.specs.dimPanelLength'), value: '600 / 1 200 / 2 400 mm' },
      { label: key('productPage.specLabels.thickness'), value: spec('rpet-groove', 'thickness') },
      { label: key('rpetGroovePage.specs.dimGrooveDepth'), value: '6 / 12 / 18 mm' },
      { label: key('productPage.specLabels.weight'), value: '2.5–7.5 kg/m²' },
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
      { label: key('productPage.specs.recycledContent'), value: spec('rpet-groove', 'recycledContentPct') },
      { label: key('rpetGroovePage.specs.matDensity'), value: '≈ 200 kg/m³' },
      { label: key('rpetGroovePage.specs.colorsLabel'), value: key('productPage.rpet.colours.rangeValue') },
      { label: key('rpetGroovePage.specs.customColors'), value: key('rpetGroovePage.specs.customColorsVal') },
      { label: key('productPage.ordering.madeIn'), value: spec('rpet-groove', 'madeIn') },
    ],
  },
  {
    title: key('rpetGroovePage.specs.fireTitle'),
    rows: [
      { label: key('productPage.specLabels.reactionFire'), value: spec('rpet-groove', 'fireClass') },
      { label: key('productPage.specLabels.testStandard'), value: 'EN 13501-1' },
      { label: key('rpetGroovePage.specs.fireReports'), value: key('productPage.ordering.onRequest') },
    ],
  },
  {
    title: key('rpetGroovePage.specs.certsTitle'),
    rows: [
      {
        label: key('rpetGroovePage.specs.certHealth'),
        value: cert('rpet-groove', 'OEKO-TEX', 'productPage.specs.oekoTexStandard100'),
      },
      { label: key('productPage.specs.endOfLife'), value: key('productPage.rpet.ordering.endOfLifeText') },
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
