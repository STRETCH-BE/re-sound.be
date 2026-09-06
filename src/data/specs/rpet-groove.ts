/**
 * rPET Groove — specification tables.
 *
 * Transcribed from src/components/sections/rpetgroovepage.tsx,
 * the former <section id="specs"> (lines 780–937 of the pre-refactor file),
 * card by card and row by row, in the original order.
 *
 * The Fire Safety card used to hard-code English labels/values although the
 * `rpetGroovePage.specs.fireEU…fireDEValue` keys exist (and are translated)
 * in every locale — those keys are used here instead.
 */
import type { SpecTableDef } from './types';
import { key } from './types';

const specs: SpecTableDef = [
  {
    title: key('rpetGroovePage.specs.dimensionsTitle'),
    rows: [
      { label: key('productPage.specs.dimPanelWidth'), value: '600 / 1200 mm' },
      { label: key('rpetGroovePage.specs.dimPanelLength'), value: '600 / 1200 / 2400 mm' },
      { label: key('productPage.specLabels.thickness'), value: '12 / 24 / 36 mm' },
      { label: key('rpetGroovePage.specs.dimGrooveDepth'), value: '6 / 12 / 18 mm' },
      { label: key('productPage.specLabels.weight'), value: '2.5 - 7.5 kg/m²' },
    ],
  },
  {
    title: key('rpetGroovePage.specs.acousticsTitle'),
    rows: [
      { label: key('rpetGroovePage.specs.acNRC12'), value: '0.55' },
      { label: key('rpetGroovePage.specs.acNRC24'), value: '0.75' },
      { label: key('rpetGroovePage.specs.acNRC36'), value: '0.90' },
      { label: key('productPage.specLabels.testStandard'), value: 'ISO 354 / ASTM C423' },
    ],
  },
  {
    title: key('rpetGroovePage.specs.materialTitle'),
    rows: [
      { label: key('rpetGroovePage.specs.matComposition'), value: key('rpetGroovePage.specs.matRecycledPET') },
      { label: key('rpetGroovePage.specs.matDensity'), value: '200-250 kg/m³' },
      { label: key('rpetGroovePage.specs.colorsLabel'), value: key('rpetGroovePage.specs.colorsVal') },
      { label: key('rpetGroovePage.specs.customColors'), value: key('rpetGroovePage.specs.customColorsVal') },
    ],
  },
  {
    title: key('rpetGroovePage.specs.fireTitle'),
    rows: [
      { label: key('rpetGroovePage.specs.fireEU'), value: 'B-s1, d0' },
      { label: key('rpetGroovePage.specs.fireUS'), value: key('rpetGroovePage.specs.fireUSValue') },
      { label: key('rpetGroovePage.specs.fireUK'), value: key('rpetGroovePage.specs.fireUKValue') },
      { label: key('rpetGroovePage.specs.fireDE'), value: 'B1' },
    ],
  },
  {
    title: key('rpetGroovePage.specs.certsTitle'),
    rows: [
      { label: key('rpetGroovePage.specs.certHealth'), value: 'OEKO-TEX® Standard 100' },
      { label: key('rpetGroovePage.specs.certEnv'), value: key('rpetGroovePage.specs.certEPD') },
      { label: key('rpetGroovePage.specs.matEmissions'), value: key('rpetGroovePage.specs.certVOC') },
      { label: key('productPage.specs.recycledContent'), value: key('rpetGroovePage.specs.certGRS') },
    ],
  },
  {
    title: key('rpetGroovePage.specs.applicationsTitle'),
    rows: [
      { label: key('rpetGroovePage.specs.appInstall'), value: key('productPage.specLabels.wallsCeilings') },
      { label: key('rpetGroovePage.specs.appEnvironment'), value: key('productPage.specLabels.envVal') },
      { label: key('rpetGroovePage.specs.appIdealFor'), value: key('rpetGroovePage.specs.appIdealVal') },
      { label: key('rpetGroovePage.specs.appAlso'), value: key('rpetGroovePage.specs.appAlsoVal') },
    ],
  },
];

export default specs;
