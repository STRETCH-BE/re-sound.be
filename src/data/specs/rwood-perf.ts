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
      { label: key('productPage.specLabels.weight'), value: '~From 0,35 kg/m²' },
      { label: key('productPage.specLabels.coreDensity'), value: '48,40 kg/m³' },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: '0.90' },
      { label: 'With 50mm mineral wool', value: 'Up to 1.00' },
      { label: key('productPage.specs.absorptionClass'), value: 'Class A / C' },
      { label: key('productPage.specLabels.testStandard'), value: 'ISO 354 / ISO 11654' },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.perforationsTitle'),
    rows: [
      { label: 'PD8 (⌀8 mm double)', value: '24% open — αw 0.85' },
      { label: 'PH10 (⌀10 mm)', value: '18% open — αw 0.75' },
      { label: 'PH8 (⌀8 mm)', value: '12% open — αw 0.55' },
      { label: 'PH5 (⌀5 mm)', value: '5% open — αw 0.35' },
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
