// CLIENT PORTAL — pricelist (/portal/pricelist).
// Server component: loads exactly the rows this account may see (Postgres RLS
// in Supabase mode), then hands off to the interactive client view. Layout and
// interaction follow Michael's pricelist mockup, restyled to the site tokens.
import { setRequestLocale } from 'next-intl/server';
import { isValidLocale, localeFullCodes, type Locale } from '@/i18n/config';
import { getPortalSession } from '@/lib/portal/auth';
import { getPricebook } from '@/lib/portal/data';
import PricelistView from '@/components/portal/PricelistView';

export default async function PortalPricelistPage({ params }: { params: { locale: string } }) {
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  setRequestLocale(locale);

  const session = await getPortalSession();
  if (!session) return null; // (app) layout already redirects

  const { rows, meta } = await getPricebook(session);

  return (
    <PricelistView
      rows={rows}
      meta={meta}
      formatLocale={localeFullCodes[locale] ?? 'en'}
      defaultCurrency={locale === 'pl' ? 'PLN' : 'EUR'}
    />
  );
}
