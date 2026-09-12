/**
 * rWood Panel (veneer) — specification tables.
 *
 * Transcribed from src/components/sections/rwoodveneerpage.tsx,
 * the former <section id="specs"> (lines 737–820 of the pre-refactor file),
 * card by card and row by row, in the original order.
 *
 * Governed figures come from src/data/products.ts via spec(): the two
 * thickness rows (standard / slim) became one row showing the stored
 * "12 / 19 mm", the two fire rows (standard / FR MDF) became one row showing
 * the stored per-core string. FSC and EPD rows are guarded by cert(). The felt
 * certification row was removed (OEKO-TEX is not held for rWood).
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('rwoodVeneerPage.specs.dimensionsTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.dimPanelWidth'), value: '1220 mm' },
      { label: key('rwoodVeneerPage.specs.dimPanelLength'), value: '2800 / 3050 mm' },
      { label: key('productPage.specLabels.thickness'), value: spec('rwood-veneer', 'thickness') },
      { label: key('rwoodVeneerPage.specs.dimWeight19'), value: '± 14.5 kg/m²' },
    ],
  },
  {
    title: key('rwoodVeneerPage.specs.compositionTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.compTopLayer'), value: key('rwoodVeneerPage.specs.compTopLayerVal') },
      { label: key('rwoodVeneerPage.specs.compCore'), value: key('rwoodVeneerPage.specs.compCoreVal') },
      { label: key('rwoodVeneerPage.specs.compBackLayer'), value: key('rwoodVeneerPage.specs.compBackLayerVal') },
      { label: key('rwoodVeneerPage.specs.compBonding'), value: key('rwoodVeneerPage.specs.compBondingVal') },
    ],
  },
  {
    title: key('rwoodVeneerPage.specs.finishTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.finishLacquerType'), value: key('rwoodVeneerPage.specs.finishLacquerVal') },
      { label: key('rwoodVeneerPage.specs.finishLayers'), value: '6' },
      { label: key('rwoodVeneerPage.specs.finishGloss'), value: key('rwoodVeneerPage.specs.finishGlossVal') },
      { label: key('rwoodVeneerPage.specs.finishAntiFingerprint'), value: key('productData.specValues.yes') },
      { label: key('rwoodVeneerPage.specs.finishScratch'), value: '≥ 2N (ISO 1518)' },
    ],
  },
  {
    title: key('rwoodVeneerPage.specs.fireTitle'),
    rows: [
      { label: key('productPage.specLabels.reactionFire'), value: spec('rwood-veneer', 'fireClass') },
      { label: key('productPage.specs.testStandard'), value: 'EN 13501-1' },
    ],
  },
  {
    title: key('rwoodVeneerPage.specs.certsTitle'),
    rows: [
      {
        label: key('rwoodVeneerPage.specs.certWoodSourcing'),
        value: cert('rwood-veneer', 'FSC', 'productPage.specs.fscCertified'),
      },
      { label: key('productPage.specs.vocEmissions'), value: key('productData.specValues.e1Carb2Compliant') },
      {
        label: key('rwoodVeneerPage.specs.certEnvironmental'),
        value: cert('rwood-veneer', 'EPD', 'productPage.specs.epd'),
      },
    ],
  },
  {
    title: key('rwoodVeneerPage.specs.processingTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.procSawing'), value: key('rwoodVeneerPage.specs.procSawingVal') },
      { label: key('rwoodVeneerPage.specs.procEdgeBanding'), value: key('rwoodVeneerPage.specs.procEdgeBandingVal') },
      { label: key('rwoodVeneerPage.specs.procCNC'), value: key('productData.specValues.suitable') },
      { label: key('rwoodVeneerPage.specs.procEnvironment'), value: key('rwoodVeneerPage.specs.procEnvironmentVal') },
      { label: key('rwoodVeneerPage.specs.procMoisture'), value: key('rwoodVeneerPage.specs.procMoistureVal') },
    ],
  },
];

export default specs;
