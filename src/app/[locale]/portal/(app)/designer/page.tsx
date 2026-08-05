// CLIENT PORTAL — ceiling designer (/portal/designer).
// The designer itself is a self-contained HTML app (drawing engine, seams,
// pricing, PDF/DXF export) served by the authenticated /api/portal/designer
// route and embedded full-height here. Keeping it in an iframe isolates its
// styles/scripts from the site and lets us update it by swapping one file.
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { getPortalSession } from '@/lib/portal/auth';

export default async function PortalDesignerPage({ params }: { params: { locale: string } }) {
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  setRequestLocale(locale);

  const session = await getPortalSession();
  if (!session) return null; // (app) layout already redirects

  const t = await getTranslations('portal.designer');

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="container" style={{ padding: '18px 0 10px' }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          <span
            style={{ background: 'var(--red)', width: 10, height: 10, display: 'inline-block', marginRight: 12 }}
          />
          {t('eyebrow')}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5, margin: '8px 0 0', maxWidth: 720 }}>
          {t('hint')}
        </p>
      </div>
      <iframe
        src="/api/portal/designer"
        title={t('eyebrow')}
        style={{
          border: 'none',
          borderTop: '1px solid var(--line, #e2e8f0)',
          width: '100%',
          height: 'calc(100vh - 120px)',
          minHeight: 760,
          display: 'block',
          background: '#eef2f7',
        }}
      />
    </div>
  );
}
