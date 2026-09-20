/**
 * rPET Panel — specification tables.
 *
 * Reconciled with the rPET Panel datasheet (EN · 09/2026, v1.0): the two
 * "Technical data" tables of page 1 (dimensions and weight; general), the
 * absorption summary of page 2 (measured on the 12 mm panel; 9 mm not yet
 * measured), reaction to fire by colour (page 2) and the OEKO-TEX row kept
 * from the earlier product data.
 *
 * Governed figures (format, thickness, αw, NRC, class, fire class, recycled
 * content, plant) come from src/data/products.ts via spec(); the OEKO-TEX row
 * is guarded by cert(). Locale-independent literals (surface weight, panel
 * weights, density, standards) are the datasheet's; values marked ≈ are
 * calculated from the nominal surface weight and the panel area.
 * The absorption class is derived from the data αw — an "up to" value gives
 * none, so that row stays hidden.
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('rpetPanelPage.specs.dimensionsTitle'),
    rows: [
      { label: key('productPage.specs.thickness'), value: spec('rpet-panel', 'thickness') },
      { label: key('rpetPanelPage.specs.formats'), value: '2 800 × 1 220 mm (3.42 m²) · 2 440 × 1 220 mm (2.98 m²)' },
      { label: key('rpetPanelPage.specs.surfaceWeight'), value: '1.8 / 2.4 kg/m²' },
      { label: key('rpetPanelPage.specs.panelWeight2800'), value: '≈ 6.1 / 8.2 kg' },
      { label: key('rpetPanelPage.specs.panelWeight2440'), value: '≈ 5.4 / 7.1 kg' },
      { label: key('productPage.specLabels.density'), value: '≈ 200 kg/m³' },
    ],
  },
  {
    title: key('rpetPanelPage.specs.generalTitle'),
    rows: [
      { label: key('rpetPanelPage.specs.physMaterial'), value: key('rpetPanelPage.specs.physMaterialVal') },
      { label: key('productPage.ordering.versions'), value: key('productPage.rpet.ordering.versionsValue') },
      { label: key('rpetPanelPage.specs.colorStandard'), value: key('productPage.rpet.colours.rangeValue') },
      { label: key('productPage.ordering.madeIn'), value: spec('rpet-panel', 'madeIn') },
      { label: key('productPage.specs.recycledContent'), value: spec('rpet-panel', 'recycledContentPct') },
    ],
  },
  {
    title: key('rpetPanelPage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: spec('rpet-panel', 'alphaW') },
      { label: key('productPage.specs.nrc'), value: spec('rpet-panel', 'nrc') },
      { label: key('productPage.specs.absorptionClass'), value: spec('rpet-panel', 'absorptionClass') },
      { label: key('rpetPanelPage.specs.acousticsMounting'), value: key('rpetPanelPage.specs.acousticsMountingVal') },
      { label: key('productPage.specs.testStandard'), value: 'EN ISO 354 · EN ISO 11654 · ASTM C423' },
      { label: key('rpetPanelPage.specs.acoustics9mm'), value: key('productPage.rpet.acoustics.notMeasured') },
    ],
  },
  {
    title: key('rpetPanelPage.specs.fireTitle'),
    rows: [
      { label: key('productPage.specLabels.reactionFire'), value: spec('rpet-panel', 'fireClass') },
      { label: key('productPage.specs.testStandard'), value: 'EN 13501-1' },
      { label: key('rpetPanelPage.specs.fireReports'), value: key('productPage.ordering.onRequest') },
    ],
  },
  {
    title: key('rpetPanelPage.specs.healthTitle'),
    rows: [
      {
        label: key('rpetPanelPage.specs.healthOekoTex'),
        value: cert('rpet-panel', 'OEKO-TEX', 'productPage.specs.oekoTexStandard100'),
      },
      { label: key('productPage.specs.endOfLife'), value: key('productPage.rpet.ordering.endOfLifeText') },
    ],
  },
];

export default specs;
