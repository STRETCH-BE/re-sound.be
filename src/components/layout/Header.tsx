'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { HUBS, HUB_IDS, hubPath } from '@/data/hubs';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';

export default function Header() {
  const t = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const locale = useLocale();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // The three range hubs (localised slugs) shown under "Products".
  const rangeLinks = HUB_IDS.map((id) => ({
    href: hubPath(HUBS[id], locale),
    label: t(`range${id.charAt(0).toUpperCase()}${id.slice(1)}`),
  }));

  // Navigation links
  const navLinks = [
    { href: '/products', label: t('products'), children: [...rangeLinks, { href: '/products', label: tFooter('allProducts') }] },
    { href: '/about', label: t('about') },
    { href: '/sustainability', label: t('sustainability') },
    { href: '/where-to-buy', label: t('whereToBuy') },
    { href: '/partner', label: t('partner') },
    { href: '/contact', label: t('contact') },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
        {/* Logo */}
        <Link href="/" className="logo">
          Re<span>—</span>Sound
        </Link>

        {/* Desktop Navigation */}
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.href} className={link.children ? 'has-dropdown' : ''}>
              <Link
                href={link.href}
                className={pathname === link.href ? 'active' : ''}
                aria-haspopup={link.children ? 'true' : undefined}
              >
                {link.label}
              </Link>
              {link.children && (
                <ul className="nav-dropdown" aria-label={link.label}>
                  {link.children.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href} prefetch={false} className={pathname === child.href ? 'active' : ''}>
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="nav-actions">
          <LanguageSwitcher />
          <Link href="/contact" className="nav-cta">
            {t('cta')}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Navigation */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
      />

      <style jsx>{`
        .has-dropdown {
          position: relative;
        }

        .nav-dropdown {
          position: absolute;
          top: 100%;
          left: -0.75rem;
          min-width: 15rem;
          margin: 0;
          padding: 0.6rem 0;
          list-style: none;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          opacity: 0;
          visibility: hidden;
          transform: translateY(6px);
          transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s;
        }

        .has-dropdown:hover .nav-dropdown,
        .has-dropdown:focus-within .nav-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .nav-dropdown li {
          display: block;
        }

        .nav-dropdown :global(a) {
          display: block;
          padding: 0.5rem 1.1rem;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .nav-dropdown li:last-child {
          margin-top: 0.3rem;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          padding-top: 0.3rem;
        }
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1.5rem 4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
          transition: all 0.4s ease;
        }

        .nav.scrolled {
          background: rgba(253, 254, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 40px rgba(0, 0, 0, 0.05);
        }

        .nav-links {
          display: flex;
          gap: 3rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-links a {
          text-decoration: none;
          color: var(--deep-blue);
          font-size: 0.95rem;
          font-weight: 500;
          position: relative;
          transition: color 0.3s ease;
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--brand-blue);
          transition: width 0.3s ease;
        }

        .nav-links a:hover::after,
        .nav-links a.active::after {
          width: 100%;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        /* ≥44x44px tap target for the language switcher trigger (WCAG 2.5.8) */
        .nav-actions :global(.lang-toggle) {
          min-width: 44px;
          min-height: 44px;
          justify-content: center;
        }

        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          /* ≥44x44px tap target (WCAG 2.5.8) — the hamburger glyph stays 24x16,
             centered inside the larger hit area. */
          min-width: 44px;
          min-height: 44px;
          z-index: 101;
        }

        .mobile-menu-btn span {
          width: 24px;
          height: 2px;
          background: var(--deep-blue);
          transition: all 0.3s ease;
          display: block;
        }

        .mobile-menu-btn.active span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .mobile-menu-btn.active span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-btn.active span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        @media (max-width: 992px) {
          .nav {
            padding: 1rem 1.5rem;
          }

          .nav-links {
            display: none;
          }

          .nav-actions {
            display: none;
          }

          .mobile-menu-btn {
            display: flex;
          }
        }

        @media (max-width: 576px) {
          .nav {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
}
