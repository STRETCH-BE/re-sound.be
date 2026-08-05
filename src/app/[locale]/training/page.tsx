// Legacy duplicate route. /training has been consolidated into
// /installer-training; this issues a permanent (308) redirect so any existing
// or external links keep working and search engines fold the two together.
// Uses the locale-aware permanentRedirect so the target is unprefixed on the
// locale's own domain (and correctly prefixed in dev/preview).
import { permanentRedirect } from '@/i18n/navigation';
import { defaultLocale, isValidLocale } from '@/i18n/config';

export const dynamic = 'force-static';

export default function Page({ params }: { params: { locale: string } }) {
  const locale = isValidLocale(params.locale) ? params.locale : defaultLocale;
  permanentRedirect({ href: '/installer-training', locale });
}
