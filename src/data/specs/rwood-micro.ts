/**
 * rWood Micro — specification tables.
 *
 * Source: the rWood Micro datasheet (EN · 09/2026, v1.0), page 2 "Panel, fire
 * and emissions" and "Sound absorption", page 1 "Four perforation densities",
 * and the rWood colour and finish guide (surface treatments, veneer ranges,
 * core colours, edges).
 *
 * Governed figures (thickness, αw, absorption class, fire class, plant, FSC)
 * come from src/data/products.ts via spec() / cert(). Locale-independent
 * literals (sizes, standards, hole sizes) are typed here as the datasheet
 * prints them; everything else is a message key.
 *
 * Removed against the earlier version (not on the datasheet): the weight
 * "~from 0,35 kg/m²", the "core density 48,40 kg/m³", "resistance to fire
 * K1-10 / K2-10" and the "backlit option".
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

// Narrow no-break space, the datasheet's thousands separator.
const NNBSP = ' ';
const SIZES = `100–3${NNBSP}050 × 100–1${NNBSP}220 mm`;

const specs: SpecTableDef = [
  {
    title: key('rwoodMicroPage.specs.panelTitle'),
    rows: [
      { label: key('rwoodMicroPage.specs.sizes'), value: SIZES },
      { label: key('productPage.specLabels.thickness'), value: spec('rwood-micro', 'thickness') },
      { label: key('productPage.specs.core'), value: key('rwoodMicroPage.specs.coreVal') },
      { label: key('rwoodMicroPage.specs.fleeceLabel'), value: key('rwoodMicroPage.specs.feltColor') },
      { label: key('productPage.ordering.madeIn'), value: spec('rwood-micro', 'madeIn') },
    ],
  },
  {
    title: key('rwoodMicroPage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: spec('rwood-micro', 'alphaW') },
      { label: key('productPage.specs.absorptionClass'), value: spec('rwood-micro', 'absorptionClass') },
      { label: key('rwoodMicroPage.specs.acWithMinWool'), value: key('rwoodMicroPage.specs.acWithMinWoolVal') },
      { label: key('productPage.specLabels.testStandard'), value: 'EN ISO 354 · EN ISO 11654' },
    ],
  },
  {
    title: key('rwoodMicroPage.specs.perfsTitle'),
    rows: [
      { label: 'Nano', value: key('rwoodMicroPage.specs.nanoVal') },
      { label: 'Micro S', value: key('rwoodMicroPage.specs.microSVal') },
      { label: 'Micro M', value: key('rwoodMicroPage.specs.microMVal') },
      { label: 'Micro L', value: key('rwoodMicroPage.specs.microLVal') },
    ],
  },
  {
    title: key('rwoodMicroPage.specs.fireTitle'),
    rows: [
      { label: key('rwoodMicroPage.specs.reactionFire'), value: spec('rwood-micro', 'fireClass') },
      { label: key('rwoodMicroPage.specs.fireStandard'), value: 'EN 13501-1' },
      {
        label: key('productPage.specLabels.woodSourcing'),
        value: cert('rwood-micro', 'FSC', 'productPage.specLabels.fscCert'),
      },
      { label: key('productPage.specLabels.formaldehyde'), value: 'E1' },
      { label: key('productPage.specLabels.environment'), value: key('rwoodMicroPage.specs.appEnvVal') },
    ],
  },
  {
    title: key('rwoodMicroPage.specs.matTitle'),
    rows: [
      { label: key('rwoodMicroPage.specs.surfaceLabel'), value: key('rwoodMicroPage.specs.surfaceVal') },
      { label: key('rwoodMicroPage.specs.finishLabel'), value: key('rwoodMicroPage.specs.finishVal') },
      { label: key('rwoodMicroPage.specs.rangesLabel'), value: key('rwoodMicroPage.specs.rangesVal') },
      { label: key('rwoodMicroPage.specs.coreColoursLabel'), value: key('rwoodMicroPage.specs.coreColoursVal') },
      { label: key('rwoodMicroPage.specs.edgesLabel'), value: key('rwoodMicroPage.specs.edgesVal') },
    ],
  },
  {
    title: key('rwoodMicroPage.specs.appsTitle'),
    rows: [
      { label: key('rwoodMicroPage.specs.appInstall'), value: key('rwoodMicroPage.specs.appWalls') },
      { label: key('rwoodMicroPage.specs.subframe'), value: key('rwoodMicroPage.specs.subframeVal') },
      { label: key('rwoodMicroPage.specs.mountingSystem'), value: key('rwoodMicroPage.specs.concealedClip') },
    ],
  },
];

export default specs;
