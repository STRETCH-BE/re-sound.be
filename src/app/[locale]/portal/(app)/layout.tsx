// CLIENT PORTAL — authenticated shell for /portal, /portal/pricelist and
// /portal/admin. Redirects to the login page when there is no active session
// and renders the dark portal bar (nav + account + sign out) above the pages.
import type { ReactNode } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { getPortalSession } from '@/lib/portal/auth';
import PortalNav from '@/components/portal/PortalNav';

export default async function PortalAppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  setRequestLocale(locale);

  const session = await getPortalSession();
  if (!session) redirect({ href: '/portal/login', locale });

  const t = await getTranslations('portal.nav');
  const { profile } = session!;

  return (
    <div style={{ background: 'var(--surface)', minHeight: '60vh' }}>
      <PortalNav
        isAdmin={profile.role === 'admin'}
        demo={session!.demo}
        company={profile.company ?? profile.email}
        email={profile.email}
        marketsLabel={
          profile.allMarkets ? t('allMarkets') : profile.markets.join(' · ') || '—'
        }
      />
      {children}
    </div>
  );
}
