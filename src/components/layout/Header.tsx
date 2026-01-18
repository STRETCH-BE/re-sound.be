'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';

export default function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation links
  const navLinks = [
    { href: '/products', label: t('products') },
    { href: '/about', label: t('about') },
    { href: '/sustainability', label: t('sustainability') },
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
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? 'active' : ''}
              >
                {link.label}
              </Link>
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

        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
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
