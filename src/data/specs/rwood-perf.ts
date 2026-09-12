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
 * Governed figures (thickness, αw, class, fire class) come from
 * src/data/products.ts via spec(); the FSC row is guarded by cert(). The
 * absorption class is derived from the data αw — a per-pattern range gives
 * none, so that row stays hidden. Removed: the "with mineral wool" αw row and
 * the per-pattern αw figures (not in the data — the perforation card keeps
 * only the open-area percentages) and "EPD available" (not held).
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('rwoodPerfPage.specs.dimensionsTitle'),
    rows: [
      { label: key('rwoodPerfPage.specs.customSizes'), value: '100–3050 × 100–1220 mm' },
      { label: key('productPage.specLabels.thickness'), value: spec('rwood-perf', 'thickness') },
      { label: key('productPage.specLabels.weight'), value: key('productData.specValues.fromWeight035') },
      { label: key('productPage.specLabels.coreDensity'), value: '48,40 kg/m³' },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: spec('rwood-perf', 'alphaW') },
      { label: key('productPage.specs.absorptionClass'), value: spec('rwood-perf', 'absorptionClass') },
      { label: key('productPage.specLabels.testStandard'), value: 'ISO 354 / ISO 11654' },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.perforationsTitle'),
    rows: [
      { label: key('productData.specValues.pd8Double'), value: key('productData.specValues.openArea24') },
      { label: 'PH10 (⌀10 mm)', value: key('productData.specValues.openArea18') },
      { label: 'PH8 (⌀8 mm)', value: key('productData.specValues.openArea12') },
      { label: 'PH5 (⌀5 mm)', value: key('productData.specValues.openArea5') },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.fireTitle'),
    rows: [
      { label: key('rwoodPerfPage.specs.reactionFire'), value: spec('rwood-perf', 'fireClass') },
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
      {
        label: key('productPage.specLabels.woodSourcing'),
        value: cert('rwood-perf', 'FSC', 'productPage.specLabels.fscCert'),
      },
      { label: key('rwoodPerfPage.specs.vocLabel'), value: key('rwoodPerfPage.specs.vocVal') },
      { label: key('productPage.specLabels.formaldehyde'), value: key('rwoodPerfPage.specs.formaldehydeVal') },
    ],
  },
];

export default specs;
