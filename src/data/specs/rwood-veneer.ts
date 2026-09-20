/**
 * rWood Panel (veneer) — specification tables.
 *
 * rWood Panel has no product datasheet of its own. The rWood colour and
 * finish guide (EN · 09/2026, v1.0, "For rWood Panel, Micro, Perf and
 * Groove") is the source for the veneers-and-finishes card. The dimension and
 * fire figures are the page's own values, read from src/data/products.ts via
 * spec(); FSC and EPD rows are guarded by cert().
 *
 * Removed in the September 2026 reconciliation because no datasheet, guide or
 * product-data comment supports them (listed as questions for Michael):
 * weight per m², core density, "HPLT press", lacquer type, layer count,
 * gloss level, anti-fingerprint, scratch resistance, VOC / CARB 2 and the
 * edgebanding row (the guide states over-veneered solid-wood edges instead).
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('rwoodVeneerPage.specs.dimensionsTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.dimPanelWidth'), value: '1 220 mm' },
      { label: key('rwoodVeneerPage.specs.dimPanelLength'), value: '2 800 · 3 050 mm' },
      { label: key('productPage.specLabels.thickness'), value: spec('rwood-veneer', 'thickness') },
      { label: key('productPage.specLabels.environment'), value: key('productPage.specLabels.envVal') },
    ],
  },
  {
    // Colour and finish guide p.2 — "Surface finishes and options"
    title: key('rwoodVeneerPage.specs.finishTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.finishRanges'), value: key('rwoodVeneerPage.specs.finishRangesVal') },
      { label: key('rwoodVeneerPage.specs.finishTreatments'), value: key('rwoodVeneerPage.specs.finishTreatmentsVal') },
      { label: key('rwoodVeneerPage.specs.finishCoreColours'), value: key('rwoodVeneerPage.specs.finishCoreColoursVal') },
      { label: key('productPage.specLabels.edges'), value: key('rwoodVeneerPage.specs.finishEdgesVal') },
      { label: key('productPage.specLabels.acousticFelt'), value: key('rwoodVeneerPage.specs.finishFeltVal') },
      { label: key('rwoodVeneerPage.specs.finishMadeToOrder'), value: key('rwoodVeneerPage.specs.finishMadeToOrderVal') },
    ],
  },
  {
    title: key('rwoodVeneerPage.specs.compositionTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.compTopLayer'), value: key('rwoodVeneerPage.specs.compTopLayerVal') },
      { label: key('rwoodVeneerPage.specs.compCore'), value: key('rwoodVeneerPage.specs.compCoreVal') },
      { label: key('rwoodVeneerPage.specs.compBackLayer'), value: key('rwoodVeneerPage.specs.compBackLayerVal') },
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
        value: cert('rwood-veneer', 'FSC', 'rwoodVeneerPage.specs.certWoodSourcingVal'),
      },
      {
        label: key('rwoodVeneerPage.specs.certEnvironmental'),
        value: cert('rwood-veneer', 'EPD', 'productPage.specs.epd'),
      },
      { label: key('productPage.ordering.madeIn'), value: spec('rwood-veneer', 'madeIn') },
    ],
  },
  {
    title: key('rwoodVeneerPage.specs.processingTitle'),
    rows: [
      { label: key('rwoodVeneerPage.specs.procSawing'), value: key('rwoodVeneerPage.specs.procSawingVal') },
      { label: key('rwoodVeneerPage.specs.procCNC'), value: key('productData.specValues.suitable') },
      { label: key('rwoodVeneerPage.specs.procMoisture'), value: key('rwoodVeneerPage.specs.procMoistureVal') },
    ],
  },
];

export default specs;
