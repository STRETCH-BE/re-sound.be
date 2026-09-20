/**
 * rWood Perf — specification tables.
 *
 * Source: the rWood Perf datasheet (EN · 09/2026, v1.0), page 2 "Panel, fire
 * and emissions" and "Sound absorption", page 1 "Four perforation patterns",
 * and the rWood colour and finish guide (surface treatments, veneer ranges,
 * core colours, edges).
 *
 * Governed figures (thickness, αw range, NRC, fire class, plant, FSC) come
 * from src/data/products.ts via spec() / cert(); the absorption class is
 * derived from the data αw — a per-pattern range gives none, so that row
 * stays hidden (the page prints the per-pattern table from the datasheet).
 * Locale-independent literals (sizes, standards) are typed as the datasheet
 * prints them; everything else is a message key.
 *
 * Removed against the earlier version (not on the datasheet): the weight
 * "~from 0,35 kg/m²", the "core density 48,40 kg/m³", "resistance to fire
 * K1-10 / K2-10", "TVOC approved (ISO 16000)" and "no added urea
 * formaldehyde" (the datasheet states formaldehyde class E1).
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

// Narrow no-break space, the datasheet's thousands separator.
const NNBSP = ' ';
const SIZES = `100–3${NNBSP}050 × 100–1${NNBSP}220 mm`;

const specs: SpecTableDef = [
  {
    title: key('rwoodPerfPage.specs.panelTitle'),
    rows: [
      { label: key('rwoodPerfPage.specs.sizes'), value: SIZES },
      { label: key('productPage.specLabels.thickness'), value: spec('rwood-perf', 'thickness') },
      { label: key('productPage.specs.core'), value: key('rwoodPerfPage.specs.coreVal') },
      { label: key('rwoodPerfPage.specs.fleeceLabel'), value: key('rwoodPerfPage.specs.feltColor') },
      { label: key('productPage.ordering.madeIn'), value: spec('rwood-perf', 'madeIn') },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: spec('rwood-perf', 'alphaW') },
      { label: key('productPage.specs.absorptionClass'), value: spec('rwood-perf', 'absorptionClass') },
      { label: key('rwoodPerfPage.specs.acWithMinWool'), value: key('rwoodPerfPage.specs.acWithMinWoolVal') },
      { label: key('productPage.specs.nrc'), value: spec('rwood-perf', 'nrc') },
      { label: key('productPage.specLabels.testStandard'), value: 'EN ISO 354 · EN ISO 11654' },
      { label: key('rwoodPerfPage.specs.mounting'), value: key('rwoodPerfPage.specs.mountingVal') },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.perforationsTitle'),
    rows: [
      { label: 'PD8', value: key('rwoodPerfPage.specs.pd8Val') },
      { label: 'PH10', value: key('rwoodPerfPage.specs.ph10Val') },
      { label: 'PH8', value: key('rwoodPerfPage.specs.ph8Val') },
      { label: 'PH5', value: key('rwoodPerfPage.specs.ph5Val') },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.fireTitle'),
    rows: [
      { label: key('rwoodPerfPage.specs.reactionFire'), value: spec('rwood-perf', 'fireClass') },
      { label: key('rwoodPerfPage.specs.fireStandard'), value: 'EN 13501-1' },
      {
        label: key('productPage.specLabels.woodSourcing'),
        value: cert('rwood-perf', 'FSC', 'productPage.specs.fscCertifiedNumber'), // C191539 covers every rWood product (Michael, 20 September 2026)
      },
      { label: key('productPage.specLabels.formaldehyde'), value: 'E1' },
      { label: key('productPage.specLabels.environment'), value: key('rwoodPerfPage.specs.envVal') },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.matTitle'),
    rows: [
      { label: key('rwoodPerfPage.specs.surfaceLabel'), value: key('rwoodPerfPage.specs.surfaceVal') },
      { label: key('rwoodPerfPage.specs.finishLabel'), value: key('rwoodPerfPage.specs.finishVal') },
      { label: key('rwoodPerfPage.specs.rangesLabel'), value: key('rwoodPerfPage.specs.rangesVal') },
      { label: key('rwoodPerfPage.specs.coreColoursLabel'), value: key('rwoodPerfPage.specs.coreColoursVal') },
      { label: key('rwoodPerfPage.specs.edgesLabel'), value: key('rwoodPerfPage.specs.edgesVal') },
    ],
  },
  {
    title: key('rwoodPerfPage.specs.appsTitle'),
    rows: [
      { label: key('rwoodPerfPage.specs.appInstall'), value: key('rwoodPerfPage.specs.appWalls') },
      { label: key('rwoodPerfPage.specs.subframe'), value: key('rwoodPerfPage.specs.subframeVal') },
      { label: key('rwoodPerfPage.specs.mountingSystem'), value: key('rwoodPerfPage.specs.concealedClip') },
    ],
  },
];

export default specs;
