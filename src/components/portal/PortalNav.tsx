'use client';

// CLIENT PORTAL — dark navigation bar shown on every authenticated portal
// page: section links with active state, the signed-in account and sign-out.
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LogOut } from 'lucide-react';

type Props = {
  isAdmin: boolean;
  demo: boolean;
  company: string;
  email: string;
  marketsLabel: string;
};

export default function PortalNav({ isAdmin, demo, company, email, marketsLabel }: Props) {
  const t = useTranslations('portal.nav');
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const items = [
    { href: '/portal', label: t('overview'), exact: true },
    { href: '/portal/pricelist', label: t('pricelist'), exact: false },
    { href: '/portal/designer', label: t('designer'), exact: false },
    ...(isAdmin ? [{ href: '/portal/admin', label: t('admin'), exact: false }] : []),
  ];

  async function signOut() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch('/api/portal/logout', { method: 'POST' });
    } finally {
      router.replace('/portal/login');
      router.refresh();
    }
  }

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div style={{ background: 'var(--black)', color: '#fff' }}>
      <div className="container portal-bar">
        <div className="portal-bar__left">
          <span className="portal-bar__brand">
            <span style={{ background: 'var(--red)', width: 9, height: 9, display: 'inline-block' }} />
            {t('label')}
            {demo && <span className="portal-bar__demo">{t('demoBadge')}</span>}
          </span>
          <nav aria-label={t('label')} className="portal-bar__nav">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href, item.exact) ? 'portal-lnk portal-lnk--on' : 'portal-lnk'}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="portal-bar__right">
          <span className="portal-bar__who" title={email}>
            <strong>{company}</strong>
            <span>{marketsLabel}</span>
          </span>
          <button type="button" onClick={signOut} disabled={busy} className="portal-signout">
            <LogOut size={13} /> {t('signOut')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .portal-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          min-height: 56px;
          flex-wrap: wrap;
          padding-top: 8px;
          padding-bottom: 8px;
        }
        .portal-bar__left {
          display: flex;
          align-items: center;
          gap: 26px;
          flex-wrap: wrap;
        }
        .portal-bar__brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .portal-bar__demo {
          background: var(--red);
          color: #fff;
          font-size: 10px;
          letter-spacing: 0.12em;
          padding: 3px 7px;
          font-weight: 800;
        }
        .portal-bar__nav {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .portal-bar__nav :global(.portal-lnk) {
          color: var(--on-dark-muted-2);
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          padding: 8px 12px;
          border-bottom: 2px solid transparent;
        }
        .portal-bar__nav :global(.portal-lnk:hover) {
          color: #fff;
        }
        .portal-bar__nav :global(.portal-lnk--on) {
          color: #fff;
          border-bottom-color: var(--red);
        }
        .portal-bar__right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .portal-bar__who {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.3;
        }
        .portal-bar__who strong {
          font-size: 12.5px;
          letter-spacing: 0.03em;
        }
        .portal-bar__who span {
          font-size: 11px;
          color: var(--on-dark-muted);
        }
        .portal-signout {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          border: 1px solid var(--line-dark);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 9px 14px;
          cursor: pointer;
        }
        .portal-signout:hover {
          background: var(--red);
          border-color: var(--red);
        }
        @media (max-width: 720px) {
          .portal-bar__who {
            display: none;
          }
        }
        @media print {
          .portal-bar,
          div {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
