/**
 * rWood Perf — specification tables.
 *
 * Transcribed from src/components/sections/rwoodperfpage.tsx,
 * the former <section id="specs"> (lines 725–876 of the pre-refactor file),
 * card by card and row by row, in the original order.
 *
 *   t('specs.x')            → key('rwoodPerfPage.specs.x')
 *   tPage('specs.x')        → key('productPage.specs.x')
 *   tPage('specLabels.x')   → key('productPage.specLabels.x')
 *
 * Literal numbers / units / standards stay literal. A few English phrases
 * were hard-coded in the JSX with no equivalent in `productPage` and are
 * kept verbatim (see untranslated literals in the refactor report).
 */
import type { SpecTableDef } from './types';
import { key } from './types';

const specs: SpecTableDef = [
  {
    title: key('rwoodPerfPage.specs.dimensionsTitle'),
    rows: [
      { label: key('rwoodPerfPage.specs.customSizes'), value: '100–3050 × 100–1220 mm' },
      { label: key('productPage.specLabels.thickness'), value: '8 - 19 mm' },
      { label: key('productPage.specLabels.weight'), value: key('productData.specValues.fromWeight035') },
      { label: key('productPage.specLabels.coreDensity'), value: '48,40 kg/m³' },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: '0.90' },
      { label: key('productData.specValues.withMineralWool50'), value: 'Up to 1.00' },
      { label: key('productPage.specs.absorptionClass'), value: key('productData.specValues.classAC') },
      { label: key('productPage.specLabels.testStandard'), value: 'ISO 354 / ISO 11654' },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.perforationsTitle'),
    rows: [
      { label: key('productData.specValues.pd8Double'), value: key('productData.specValues.open24Aw085') },
      { label: 'PH10 (⌀10 mm)', value: key('productData.specValues.open18Aw075') },
      { label: 'PH8 (⌀8 mm)', value: key('productData.specValues.open12Aw055') },
      { label: 'PH5 (⌀5 mm)', value: key('productData.specValues.open5Aw035') },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.fireTitle'),
    rows: [
      { label: key('rwoodPerfPage.specs.reactionFire'), value: 'B-s1, d0' },
      { label: key('rwoodPerfPage.specs.resistanceFire'), value: 'K1-10 / K2-10' },
      { label: key('productPage.specs.core'), value: key('rwoodPerfPage.specs.fireRetardant') },
      { label: key('productPage.specLabels.testStandard'), value: 'EN 13501' },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.matTitle'),
    rows: [
      { label: key('rwoodPerfPage.specs.surfaceLabel'), value: key('rwoodPerfPage.specs.surfaceVal') },
      { label: key('productPage.specs.core'), value: key('rwoodPerfPage.specs.coreVal') },
      { label: key('rwoodPerfPage.specs.edgesLabel'), value: key('rwoodPerfPage.specs.edgesVal') },
      { label: key('rwoodPerfPage.specs.acousticFelt'), value: key('rwoodPerfPage.specs.feltColor') },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.certsTitle'),
    rows: [
      { label: key('productPage.specLabels.woodSourcing'), value: key('productPage.specLabels.fscCert') },
      { label: key('rwoodPerfPage.specs.vocLabel'), value: key('rwoodPerfPage.specs.vocVal') },
      { label: key('productPage.specLabels.formaldehyde'), value: key('rwoodPerfPage.specs.formaldehydeVal') },
      { label: key('rwoodPerfPage.specs.envLabel'), value: key('productPage.specLabels.epd') },
    ],
  },
];

export default specs;
