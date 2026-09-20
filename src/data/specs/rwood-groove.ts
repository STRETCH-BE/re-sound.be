/**
 * rWood Groove — specification tables.
 *
 * Source: rWood Groove product datasheet (EN · 09/2026, v1.0), pages 1–3.
 * Cards follow the datasheet's own tables, in its order: Plank · Sound
 * absorption · Fire (EN 13501-1) and emissions · Finish · Options.
 *
 * Governed figures (thickness, αw, absorption class, fire class of the FR
 * core, plant, certifications) come from src/data/products.ts via spec() and
 * cert(). Two fire rows are datasheet literals for parts of the plank that
 * products.ts does not model as separate facts: the standard MDF core
 * (D-s2,d2) and the felt backing (B-s1,d0) — datasheet page 2, "Fire
 * (EN 13501-1) and emissions". Everything else literal here is a number, a
 * unit or a standard that reads the same in every language.
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

const specs: SpecTableDef = [
  {
    // Datasheet p.2 — "Plank" + p.1 weight and tolerances line
    title: key('rwoodGroovePage.specs.plankTitle'),
    rows: [
      { label: key('rwoodGroovePage.specs.dimPanelWidth'), value: '300 mm' },
      { label: key('rwoodGroovePage.specs.dimPanelLength'), value: '2 400 · 2 780 mm' },
      { label: key('productPage.specLabels.thickness'), value: spec('rwood-groove', 'thickness') },
      { label: key('rwoodGroovePage.specs.dimGroove'), value: key('rwoodGroovePage.specs.dimGrooveVal') },
      { label: key('productData.specValues.felt'), value: key('rwoodGroovePage.specs.feltVal') },
      { label: key('productPage.specLabels.connection'), value: key('rwoodGroovePage.specs.connVal') },
      { label: key('productPage.specLabels.environment'), value: key('productPage.specLabels.envVal') },
      { label: key('rwoodGroovePage.specs.weightPlank'), value: key('rwoodGroovePage.specs.weightPlankVal') },
      { label: key('rwoodGroovePage.specs.tolerances'), value: key('rwoodGroovePage.specs.tolerancesVal') },
    ],
  },
  {
    // Datasheet p.2 — "Sound absorption"
    title: key('rwoodGroovePage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: spec('rwood-groove', 'alphaW') },
      { label: key('productPage.specs.absorptionClass'), value: spec('rwood-groove', 'absorptionClass') },
      { label: key('productPage.specs.testStandard'), value: 'EN ISO 354 · EN ISO 11654' },
      { label: key('rwoodGroovePage.specs.octaveBands'), value: key('rwoodGroovePage.specs.octaveBandsVal') },
    ],
  },
  {
    // Datasheet p.2 — "Fire (EN 13501-1) and emissions"
    title: key('rwoodGroovePage.specs.fireTitle'),
    rows: [
      { label: key('rwoodGroovePage.specs.fireStdCore'), value: 'D-s2,d2' },
      { label: key('rwoodGroovePage.specs.fireFrCore'), value: spec('rwood-groove', 'fireClass') },
      { label: key('rwoodGroovePage.specs.fireFelt'), value: 'B-s1,d0' },
      { label: key('productPage.specLabels.formaldehyde'), value: 'E1' },
      {
        label: key('productPage.specLabels.woodSourcing'),
        value: cert('rwood-groove', 'FSC', 'rwoodGroovePage.specs.fscVal'),
      },
      {
        label: key('productPage.specLabels.feltCert'),
        value: cert('rwood-groove', 'OEKO-TEX', 'productPage.specs.oekoTexStandard100'),
      },
      {
        label: key('productPage.specLabels.envLabel'),
        value: cert('rwood-groove', 'EPD', 'rwoodGroovePage.specs.epdVal'),
      },
      { label: key('productPage.ordering.madeIn'), value: spec('rwood-groove', 'madeIn') },
    ],
  },
  {
    // Datasheet p.3 — "Finish"
    title: key('rwoodGroovePage.specs.finishTitle'),
    rows: [
      { label: key('rwoodGroovePage.specs.matFinish'), value: key('rwoodGroovePage.specs.finishVal') },
      { label: key('rwoodGroovePage.specs.oakOilColours'), value: key('rwoodGroovePage.specs.oakOilColoursVal') },
      { label: key('rwoodGroovePage.specs.walnutFinish'), value: key('rwoodGroovePage.specs.walnutFinishVal') },
      { label: key('rwoodGroovePage.specs.feltColours'), value: key('rwoodGroovePage.specs.feltColoursVal') },
    ],
  },
  {
    // Datasheet p.3 — "Options"
    title: key('rwoodGroovePage.specs.optionsTitle'),
    rows: [
      { label: key('productPage.specs.core'), value: key('rwoodGroovePage.specs.matCoreVal') },
      { label: key('productPage.specLabels.surface'), value: key('rwoodGroovePage.specs.surfaceVal') },
      { label: key('rwoodGroovePage.specs.madeToOrder'), value: key('rwoodGroovePage.specs.madeToOrderVal') },
      { label: key('rwoodGroovePage.specs.accessories'), value: key('rwoodGroovePage.specs.accessoriesVal') },
    ],
  },
];

export default specs;
