import { defineRouting } from 'next-intl/routing';

import { guidePathnames } from '@/data/guides';
import { hubPathnames } from '@/data/hubs';
import { manufacturingPathnames } from '@/data/manufacturing';
import { defaultLocale, locales } from './config';

/**
 * Routing config for the next-intl middleware.
 *
 * `pathnames` only lists the three range hubs: their external URL is
 * localised (e.g. /nl/products/pet-akoestische-panelen) while the internal
 * file-system route stays English (/products/pet-acoustic-panels). Every
 * other route is unlisted and passes through unchanged. Locales without a
 * localised slug (es, pt, da, sv, no, is) use the English slug — see
 * src/data/hubs.ts.
 *
 * Links to hubs use `hubPath(hub, locale)` with the shared `Link`, so the
 * rest of the app keeps its untyped string hrefs.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames: { ...hubPathnames(), ...guidePathnames(), ...manufacturingPathnames() },
});
