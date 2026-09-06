/**
 * rPET Flex-Groove — specification tables.
 *
 * Transcribed from src/components/sections/rpetflexgroovepage.tsx,
 * the former <section id="specs"> (lines 606–753 of the pre-refactor file),
 * card by card and row by row, in the original order.
 */
import type { SpecTableDef } from './types';
import { key } from './types';

const specs: SpecTableDef = [
  {
    title: key('rpetFlexGroovePage.specs.dimensionsTitle'),
    rows: [
      { label: key('rpetFlexGroovePage.specs.dimPanelLength'), value: '2880 mm' },
      { label: key('rpetFlexGroovePage.specs.dimPanelWidth'), value: '1130 mm' },
      { label: key('productPage.specLabels.thickness'), value: '9 mm' },
      { label: key('productPage.specLabels.weight'), value: '4.4 kg' },
      { label: key('rpetFlexGroovePage.specs.dimDensity'), value: '1.35 kg/m²' },
    ],
  },
  {
    title: key('rpetFlexGroovePage.specs.flexibilityTitle'),
    rows: [
      { label: key('rpetFlexGroovePage.specs.flexMinRadius'), value: '500 mm' },
      { label: key('rpetFlexGroovePage.specs.flexBendDir'), value: key('rpetFlexGroovePage.specs.flexBendDirVal') },
      { label: key('rpetFlexGroovePage.specs.flexCutType'), value: key('rpetFlexGroovePage.specs.flexCutTypeVal') },
    ],
  },
  {
    title: key('rpetFlexGroovePage.specs.materialTitle'),
    rows: [
      { label: key('rpetFlexGroovePage.specs.matComposition'), value: key('rpetFlexGroovePage.specs.matCompositionVal') },
      { label: key('productPage.specs.recycledContent'), value: '100%' },
      { label: key('rpetFlexGroovePage.specs.matFireRetardant'), value: key('rpetFlexGroovePage.specs.matFireRetardantVal') },
      { label: key('rpetFlexGroovePage.specs.matColorVar'), value: key('rpetFlexGroovePage.specs.matColorVarVal') },
    ],
  },
  {
    title: key('rpetFlexGroovePage.specs.fireTitle'),
    rows: [
      // The JSX read `tPage('specs.fireRating') || t('specs.fireRating')`; the
      // fallback could never fire (next-intl always returns a string), so the
      // productPage key is the one that was actually displayed.
      { label: key('productPage.specs.fireRating'), value: 'B-s1, d0' },
      { label: key('productPage.specLabels.testStandard'), value: 'EN 13501-1' },
      { label: key('rpetFlexGroovePage.specs.fireSmokeProduction'), value: 's1 (low)' },
      { label: key('rpetFlexGroovePage.specs.fireFlamingDroplets'), value: key('rpetFlexGroovePage.specs.fireFlamingDropletsVal') },
    ],
  },
  {
    title: key('rpetFlexGroovePage.specs.certsTitle'),
    rows: [
      { label: key('rpetFlexGroovePage.specs.certMaterial'), value: 'OEKO-TEX® Standard 100' },
      { label: key('rpetFlexGroovePage.specs.certVOC'), value: key('rpetFlexGroovePage.specs.certVOCVal') },
      { label: key('productPage.specs.recycledContent'), value: key('rpetFlexGroovePage.specs.certRecycledVal') },
    ],
  },
  {
    title: key('rpetFlexGroovePage.specs.applicationsTitle'),
    rows: [
      { label: key('rpetFlexGroovePage.specs.appSurfaces'), value: key('rpetFlexGroovePage.specs.appSurfacesVal') },
      { label: key('rpetFlexGroovePage.specs.appEnvironment'), value: key('rpetFlexGroovePage.specs.appEnvironmentVal') },
      { label: key('rpetFlexGroovePage.specs.appInstallation'), value: key('rpetFlexGroovePage.specs.appInstallationVal') },
      { label: key('rpetFlexGroovePage.specs.appOrientation'), value: key('rpetFlexGroovePage.specs.appOrientationVal') },
    ],
  },
];

export default specs;
