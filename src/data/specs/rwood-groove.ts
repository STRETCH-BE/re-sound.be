/**
 * rWood Groove — specification tables.
 *
 * Transcribed from src/components/sections/rwoodgroovepage.tsx,
 * the former <section id="specs"> (lines 670–821 of the pre-refactor file),
 * card by card and row by row, in the original order.
 */
import type { SpecTableDef } from './types';
import { key } from './types';

const specs: SpecTableDef = [
  {
    title: key('rwoodGroovePage.specs.dimensionsTitle'),
    rows: [
      { label: key('rwoodGroovePage.specs.dimPanelWidth'), value: '300 mm' },
      { label: key('rwoodGroovePage.specs.dimPanelLength'), value: '2400 / 2780 mm' },
      { label: key('productPage.specLabels.thickness'), value: '19 mm' },
      { label: key('rwoodGroovePage.specs.dimGrooveDepth'), value: '15 mm' },
      { label: key('rwoodGroovePage.specs.dimGrooveWidth'), value: '15 mm' },
    ],
  },
  {
    title: key('rwoodGroovePage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: '0.90' },
      { label: key('productPage.specs.absorptionClass'), value: key('productPage.acoustics.classA') },
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
      { label: key('rwoodGroovePage.specs.stdPanels'), value: 'D-s2, d2' },
      { label: key('rwoodGroovePage.specs.fireMdfVal'), value: 'B-s1, d0' },
      { label: key('productData.specValues.felt'), value: 'B-s1, d0' },
      { label: key('productPage.specs.testStandard'), value: 'EN 13501' },
    ],
  },
  {
    title: key('rwoodGroovePage.specs.certsTitle'),
    rows: [
      { label: key('productPage.specLabels.woodSourcing'), value: key('productPage.specLabels.fscCert') },
      { label: key('rwoodGroovePage.specs.feltCert'), value: 'OEKO-TEX® Standard 100' },
      { label: key('rwoodGroovePage.specs.envLabel'), value: key('productPage.specLabels.epd') },
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
