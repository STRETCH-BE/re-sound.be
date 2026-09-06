/**
 * rWood Panel (veneer) — specification tables.
 *
 * Transcribed from src/components/sections/rwoodveneerpage.tsx,
 * the former <section id="specs"> (lines 737–820 of the pre-refactor file),
 * card by card and row by row, in the original order.
 */
import type { SpecTableDef } from './types';
import { key } from './types';

const specs: SpecTableDef = [
  {
    title: key('rwoodVeneerPage.specs.dimensionsTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.dimPanelWidth'), value: '1220 mm' },
      { label: key('rwoodVeneerPage.specs.dimPanelLength'), value: '2800 / 3050 mm' },
      { label: key('rwoodVeneerPage.specs.dimThicknessStd'), value: '19 mm' },
      { label: key('rwoodVeneerPage.specs.dimThicknessSlim'), value: '12 mm' },
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
      { label: key('rwoodVeneerPage.specs.finishAntiFingerprint'), value: 'Yes' },
      { label: key('rwoodVeneerPage.specs.finishScratch'), value: '≥ 2N (ISO 1518)' },
    ],
  },
  {
    title: key('rwoodVeneerPage.specs.fireTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.fireStdMDF'), value: 'D-s2, d0' },
      { label: key('rwoodVeneerPage.specs.fireFRMDF'), value: 'B-s1, d0' },
      { label: key('productPage.specs.testStandard'), value: 'EN 13501-1' },
    ],
  },
  {
    title: key('rwoodVeneerPage.specs.certsTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.certWoodSourcing'), value: key('productPage.specs.fscCertified') },
      { label: key('productPage.specs.vocEmissions'), value: 'E1 / CARB 2 compliant' },
      { label: key('rwoodVeneerPage.specs.certEnvironmental'), value: key('productPage.specs.epd') },
      { label: key('rwoodVeneerPage.specs.certFelt'), value: 'OEKO-TEX® Standard 100' },
    ],
  },
  {
    title: key('rwoodVeneerPage.specs.processingTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.procSawing'), value: key('rwoodVeneerPage.specs.procSawingVal') },
      { label: key('rwoodVeneerPage.specs.procEdgeBanding'), value: key('rwoodVeneerPage.specs.procEdgeBandingVal') },
      { label: key('rwoodVeneerPage.specs.procCNC'), value: 'Suitable' },
      { label: key('rwoodVeneerPage.specs.procEnvironment'), value: key('rwoodVeneerPage.specs.procEnvironmentVal') },
      { label: key('rwoodVeneerPage.specs.procMoisture'), value: key('rwoodVeneerPage.specs.procMoistureVal') },
    ],
  },
];

export default specs;
