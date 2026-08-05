// CLIENT PORTAL — admin (/portal/admin). Admin accounts only:
//   1. Pricelist sync — upload the Alto Pricing System .xlsx; the PriceBook
//      sheet replaces the database pricelist (client-safe columns only).
//   2. Client accounts — create logins, assign markets, activate/deactivate.
import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { getPortalSession } from '@/lib/portal/auth';
import AdminPanel from '@/components/portal/AdminPanel';

export default async function PortalAdminPage({ params }: { params: { locale: string } }) {
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  setRequestLocale(locale);

  const session = await getPortalSession();
  if (!session) return null; // (app) layout already redirects
  if (session.profile.role !== 'admin') redirect({ href: '/portal', locale });

  return <AdminPanel demo={session!.demo} />;
}
