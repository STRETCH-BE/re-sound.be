'use client';

// Sticky site header: black utility bar (reseller/training/phone/language) + a
// white nav row. Solutions and Technical each open a rich three-panel mega menu
// (see MegaMenu). "Free quote" opens the lead modal.
import { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { contact } from '@/lib/site-config';
import { ModalButton } from '@/components/ui/ModalButton';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';
import MegaMenu, { useSolutionsMenu, useTechnicalMenu } from './MegaMenu';
import { analytics } from '@/lib/analytics';

type OpenMenu = 'solutions' | 'technical' | null;

export default function Header() {
  const t = useTranslations('common');
  const solutionsMenu = useSolutionsMenu();
  const technicalMenu = useTechnicalMenu();
  const pathname = usePathname();
  const [open, setOpen] = useState<OpenMenu>(null);

  // Close any open mega menu whenever the route changes.
  useEffect(() => {
    setOpen(null);
  }, [pathname]);

  const close = () => setOpen(null);

  return (
    <header
      onMouseLeave={close}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        background: 'rgba(255,255,255,.96)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Utility bar */}
      <div style={{ background: 'var(--black)', color: '#fff' }}>
        <div className="container" style={{ height: 42, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, background: 'var(--red)', display: 'inline-block' }} />
            <span>{t('handMadeInBelgium')}</span>
          </div>
          <div className="only-desktop" style={{ display: 'flex', alignItems: 'center', gap: 26, fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>
            <Link href="/partners" className="lnk">{t('nav.reseller')}</Link>
            <Link href="/installer-training" className="lnk">{t('nav.training')}</Link>
            <Link href="/portal" className="lnk">{t('nav.clientLogin')}</Link>
            <span style={{ opacity: 0.4 }}>|</span>
            <a href={contact.phoneHref} className="lnk" style={{ color: 'var(--red)' }} onClick={() => analytics.phoneClick('header_utility')}>
              {contact.phoneDisplay}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container" style={{ height: 'var(--header-h)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" aria-label="STRETCH — home" onMouseEnter={close} style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 27, letterSpacing: '-.02em', color: 'var(--black)' }}>STRETCH</span>
          <span style={{ color: 'var(--red)', fontWeight: 900, fontSize: 16 }}>®</span>
        </Link>

        <nav className="only-desktop" aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: 30, fontSize: 13.5, fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase' }}>
          <NavDrop label={t('nav.solutions')} href="/products" active={open === 'solutions'} onEnter={() => setOpen('solutions')} />
          <NavDrop label={t('nav.technical')} href="/products" active={open === 'technical'} onEnter={() => setOpen('technical')} />
          <Link href="/inspiration" className="lnk" onMouseEnter={close}>{t('nav.inspiration')}</Link>
          <Link href="/partners" className="lnk" onMouseEnter={close}>{t('nav.partners')}</Link>
          <Link href="/faq" className="lnk" onMouseEnter={close}>{t('nav.faq')}</Link>
          <Link href="/contact" className="lnk" onMouseEnter={close}>{t('nav.contact')}</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ModalButton type="quote" source="header" trackQuote className="btn btn--primary btn--sm only-desktop">
            {t('cta.freeQuote')} <ArrowUpRight size={14} />
          </ModalButton>
          <MobileMenu />
        </div>
      </div>

      {/* Mega menus */}
      {open && (
        <div
          className="only-desktop"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            background: '#fff',
            borderTop: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 60,
          }}
        >
          <MegaMenu config={open === 'solutions' ? solutionsMenu : technicalMenu} onNavigate={close} />
        </div>
      )}
    </header>
  );
}

// Nav item that is both a link (to its overview) and a mega-menu trigger on hover.
function NavDrop({ label, href, active, onEnter }: { label: string; href: string; active: boolean; onEnter: () => void }) {
  return (
    <div
      onMouseEnter={onEnter}
      style={{ display: 'flex', alignItems: 'center', gap: 6, height: 'var(--header-h)', cursor: 'pointer', color: active ? 'var(--red)' : 'var(--black)' }}
    >
      <Link href={href} className="lnk" aria-expanded={active} style={{ color: 'inherit' }}>
        {label}
      </Link>
      <ChevronDown size={13} style={{ transition: 'transform .2s', transform: active ? 'rotate(180deg)' : 'none', color: active ? 'var(--red)' : 'var(--text-faint-2)' }} />
    </div>
  );
}
