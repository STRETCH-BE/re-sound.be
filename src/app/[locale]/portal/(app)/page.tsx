// CLIENT PORTAL — overview (/portal). Greets the signed-in client and links
// the portal's data sources. The pricelist is live today; documents and order
// history are staged as the next data sources on this platform.
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight, FileSpreadsheet, FolderOpen, PackageSearch, PencilRuler, Settings2 } from 'lucide-react';
import { isValidLocale, type Locale } from '@/i18n/config';
import { getPortalSession } from '@/lib/portal/auth';
import { getPricebook } from '@/lib/portal/data';

export default async function PortalOverviewPage({ params }: { params: { locale: string } }) {
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  setRequestLocale(locale);

  const session = await getPortalSession();
  if (!session) return null; // (app) layout already redirects
  const t = await getTranslations('portal.dash');

  const { rows, meta } = await getPricebook(session);
  const productCount = new Set(rows.map((r) => `${r.category}||${r.product}`)).size;

  const name = session.profile.company ?? session.profile.email;

  return (
    <div className="container" style={{ padding: 'clamp(28px,4vw,56px) 0 clamp(40px,5vw,72px)' }}>
      <p className="eyebrow">
        <span style={{ background: 'var(--red)', width: 10, height: 10, display: 'inline-block', marginRight: 12 }} />
        {t('eyebrow')}
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          textTransform: 'uppercase',
          fontSize: 'clamp(30px,4.4vw,54px)',
          lineHeight: 1,
          margin: '14px 0 10px',
        }}
      >
        {t('welcome')}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15.5, margin: '0 0 34px', maxWidth: 640 }}>
        {t('intro', { name })}
      </p>

      <div className="portal-tiles">
        {/* Pricelist — live */}
        <Link href="/portal/pricelist" className="portal-tile portal-tile--live">
          <div className="portal-tile__head">
            <FileSpreadsheet size={20} />
            <span className="portal-tile__badge portal-tile__badge--live">{t('live')}</span>
          </div>
          <h2>{t('tilePricelist')}</h2>
          <p>{t('tilePricelistBody')}</p>
          <div className="portal-tile__meta">
            {t('products', { count: productCount })} · {t('version')} {meta.version}
          </div>
          <span className="portal-tile__cta">
            {t('open')} <ArrowRight size={14} />
          </span>
        </Link>

        {/* Ceiling designer — live */}
        <Link href="/portal/designer" className="portal-tile portal-tile--live">
          <div className="portal-tile__head">
            <PencilRuler size={20} />
            <span className="portal-tile__badge portal-tile__badge--live">{t('live')}</span>
          </div>
          <h2>{t('tileDesigner')}</h2>
          <p>{t('tileDesignerBody')}</p>
          <span className="portal-tile__cta">
            {t('open')} <ArrowRight size={14} />
          </span>
        </Link>

        {/* Documents — staged next data source */}
        <div className="portal-tile portal-tile--soon" aria-disabled>
          <div className="portal-tile__head">
            <FolderOpen size={20} />
            <span className="portal-tile__badge">{t('soon')}</span>
          </div>
          <h2>{t('tileDocs')}</h2>
          <p>{t('tileDocsBody')}</p>
        </div>

        {/* Orders — staged next data source */}
        <div className="portal-tile portal-tile--soon" aria-disabled>
          <div className="portal-tile__head">
            <PackageSearch size={20} />
            <span className="portal-tile__badge">{t('soon')}</span>
          </div>
          <h2>{t('tileOrders')}</h2>
          <p>{t('tileOrdersBody')}</p>
        </div>

        {/* Admin — only for admins */}
        {session.profile.role === 'admin' && (
          <Link href="/portal/admin" className="portal-tile">
            <div className="portal-tile__head">
              <Settings2 size={20} />
            </div>
            <h2>{t('tileAdmin')}</h2>
            <p>{t('tileAdminBody')}</p>
            <span className="portal-tile__cta">
              {t('open')} <ArrowRight size={14} />
            </span>
          </Link>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .portal-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .portal-tile { background: #fff; border: 1px solid var(--border); padding: clamp(20px,2.2vw,28px); display: flex; flex-direction: column; gap: 10px; text-decoration: none; color: var(--text); position: relative; }
        a.portal-tile:hover { border-color: var(--black); }
        a.portal-tile:hover .portal-tile__cta { color: var(--red); }
        .portal-tile__head { display: flex; align-items: center; justify-content: space-between; color: var(--black); margin-bottom: 4px; }
        .portal-tile h2 { margin: 0; font-size: 17px; font-weight: 800; letter-spacing: .03em; text-transform: uppercase; }
        .portal-tile p { margin: 0; color: var(--text-muted); font-size: 13.5px; line-height: 1.6; flex: 1; }
        .portal-tile__meta { font-size: 12px; color: var(--text-faint); }
        .portal-tile__cta { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; margin-top: 6px; }
        .portal-tile__badge { font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; padding: 4px 8px; background: var(--surface); border: 1px solid var(--border-2); color: var(--text-muted-2); }
        .portal-tile__badge--live { background: var(--red); border-color: var(--red); color: #fff; }
        .portal-tile--soon { opacity: .72; }
        @media (max-width: 980px) { .portal-tiles { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 640px) { .portal-tiles { grid-template-columns: 1fr; } }
      ` }} />
    </div>
  );
}
