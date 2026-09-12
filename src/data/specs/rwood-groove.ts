/**
 * rWood Groove — specification tables.
 *
 * Transcribed from src/components/sections/rwoodgroovepage.tsx,
 * the former <section id="specs"> (lines 670–821 of the pre-refactor file),
 * card by card and row by row, in the original order.
 *
 * Governed figures (thickness, αw, class, fire class) come from
 * src/data/products.ts via spec(); the FSC row is guarded by cert(). Rows the
 * data does not support were removed: the per-core fire classes (the data
 * holds one confirmed class), the felt's own fire class, the felt
 * certification (OEKO-TEX is not held for rWood) and "EPD available".
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('rwoodGroovePage.specs.dimensionsTitle'),
    rows: [
      { label: key('rwoodGroovePage.specs.dimPanelWidth'), value: '300 mm' },
      { label: key('rwoodGroovePage.specs.dimPanelLength'), value: '2400 / 2780 mm' },
      { label: key('productPage.specLabels.thickness'), value: spec('rwood-groove', 'thickness') },
      { label: key('rwoodGroovePage.specs.dimGrooveDepth'), value: '15 mm' },
      { label: key('rwoodGroovePage.specs.dimGrooveWidth'), value: '15 mm' },
    ],
  },
  {
    title: key('rwoodGroovePage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: spec('rwood-groove', 'alphaW') },
      { label: key('productPage.specs.absorptionClass'), value: spec('rwood-groove', 'absorptionClass') },
      { label: key('productPage.specs.testStandard'), value: 'ISO 354 / ISO 11654' },
    ],
  },
  {
    title: key('rwoodGroovePage.specs.materialsTitle'),
    rows: [
      { label: key('rwoodGroovePage.specs.matVeneer'), value: key('rwoodGroovePage.specs.matVeneerVal') },
      { label: key('productPage.specs.core'), value: key('rwoodGroovePage.specs.matCoreVal') },
      { label: key('productData.specValues.felt'), value: key('rwoodGroovePage.specs.matBackingVal') },
      { label: key('rwoodGroovePage.specs.matFinish'), value: key('rwoodGroovePage.specs.finishVal') },
    ],
  },
  {
    title: key('rwoodGroovePage.specs.fireTitle'),
    rows: [
      { label: key('productPage.specLabels.reactionFire'), value: spec('rwood-groove', 'fireClass') },
      { label: key('productPage.specs.testStandard'), value: 'EN 13501' },
    ],
  },
  {
    title: key('rwoodGroovePage.specs.certsTitle'),
    rows: [
      {
        label: key('productPage.specLabels.woodSourcing'),
        value: cert('rwood-groove', 'FSC', 'productPage.specLabels.fscCert'),
      },
      { label: key('rwoodGroovePage.specs.vocLabel'), value: key('rwoodGroovePage.specs.vocVal') },
    ],
  },
  {
    title: key('rwoodGroovePage.specs.applicationsTitle'),
    rows: [
      { label: key('rwoodGroovePage.specs.appInstall'), value: key('rwoodGroovePage.specs.appWalls') },
      { label: key('rwoodGroovePage.specs.appEnv'), value: key('rwoodGroovePage.specs.appEnvVal') },
      { label: key('rwoodGroovePage.specs.appMoist'), value: key('rwoodGroovePage.specs.appMoistVal') },
      { label: key('rwoodGroovePage.specs.appConn'), value: key('rwoodGroovePage.specs.appConnVal') },
    ],
  },
];

export default specs;
