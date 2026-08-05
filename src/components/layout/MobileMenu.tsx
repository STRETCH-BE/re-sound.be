'use client';

// Mobile navigation drawer (shown below 860px via the .only-mobile helper).
// Full-screen overlay with the nav links, product list, and a quote CTA.
import { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { products } from '@/lib/products';
import { contact } from '@/lib/site-config';
import { useLeadModal } from '@/components/LeadGenModal';
import { analytics } from '@/lib/analytics';

export default function MobileMenu() {
  const t = useTranslations('common');
  const tc = useTranslations('catalog');
  const pathname = usePathname();
  const { open: openModal } = useLeadModal();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="only-mobile" style={{ display: 'none' }}>
      <button
        type="button"
        aria-label={t('openMenu')}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          display: 'flex',
          color: 'var(--black)',
        }}
      >
        <Menu size={26} />
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <div
            className="container"
            style={{
              height: 'var(--header-h)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 24,
                  letterSpacing: '-.02em',
                }}
              >
                STRETCH
              </span>
              <span style={{ color: 'var(--red)', fontWeight: 900, fontSize: 14 }}>®</span>
            </span>
            <button
              type="button"
              aria-label={t('closeMenu')}
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}
            >
              <X size={26} />
            </button>
          </div>

          <nav
            className="container"
            style={{ paddingTop: 28, paddingBottom: 28, display: 'flex', flexDirection: 'column' }}
          >
            {[
              { href: '/products', label: t('nav.solutions') },
              { href: '/inspiration', label: t('nav.inspiration') },
              { href: '/partners', label: t('nav.partners') },
              { href: '/installer-training', label: t('nav.training') },
              { href: '/faq', label: t('nav.faq') },
              { href: '/about', label: t('nav.about') },
              { href: '/contact', label: t('nav.contact') },
              { href: '/portal', label: t('nav.clientLogin') },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 26,
                  textTransform: 'uppercase',
                  letterSpacing: '-.02em',
                  padding: '13px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {item.label}
              </Link>
            ))}

            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: 'var(--text-faint-2)',
                margin: '26px 0 12px',
              }}
            >
              {t('nav.allSolutions')}
            </div>
            {products.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                style={{ padding: '9px 0', fontSize: 15, fontWeight: 600, color: 'var(--text-muted)' }}
              >
                {tc(`${p.key}.name`)}
              </Link>
            ))}

            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: 'var(--text-faint-2)',
                margin: '26px 0 12px',
              }}
            >
              {t('nav.technical')}
            </div>
            {[
              { href: '/samples', label: 'Request samples' },
              { href: '/blog', label: 'Guides & specs' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ padding: '9px 0', fontSize: 15, fontWeight: 600, color: 'var(--text-muted)' }}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              className="btn btn--primary"
              style={{ marginTop: 28, justifyContent: 'center' }}
              onClick={() => {
                setOpen(false);
                analytics.quoteClick(undefined, 'mobile_menu');
                openModal('quote', { source: 'mobile_menu' });
              }}
            >
              {t('cta.requestQuote')} <ArrowUpRight size={16} />
            </button>
            <a
              href={contact.phoneHref}
              onClick={() => analytics.phoneClick('mobile_menu')}
              style={{
                marginTop: 18,
                textAlign: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 20,
                color: 'var(--black)',
              }}
            >
              {contact.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
