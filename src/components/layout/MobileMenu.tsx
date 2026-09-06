'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { href: string; label: string; children?: { href: string; label: string }[] }[];
}

export default function MobileMenu({ isOpen, onClose, navLinks }: MobileMenuProps) {
  const t = useTranslations('nav');

  // Close the open menu on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <div
      id="mobile-nav-menu"
      className={`mobile-nav ${isOpen ? 'active' : ''}`}
      aria-hidden={!isOpen}
    >
      {navLinks.map((link, index) => (
        <div key={link.href} className="mobile-nav-group" style={{ animationDelay: `${index * 0.1}s` }}>
          <Link
            href={link.href}
            prefetch={false}
            className="mobile-nav-link"
            onClick={onClose}
          >
            {link.label}
          </Link>
          {link.children && (
            <ul className="mobile-nav-sub">
              {link.children.map((child) => (
                <li key={child.href}>
                  <Link href={child.href} prefetch={false} onClick={onClose}>
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <div className="mobile-nav-actions">
        <LanguageSwitcher />
        <Link href="/contact" prefetch={false} className="nav-cta" onClick={onClose}>
          {t('cta')}
        </Link>
      </div>

      <style jsx>{`
        .mobile-nav-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
        }

        .mobile-nav-sub {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }

        .mobile-nav-sub :global(a) {
          font-size: 1rem;
          color: var(--text-secondary, #555);
          text-decoration: none;
        }
        .mobile-nav {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--warm-white);
          z-index: 99;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          opacity: 0;
          /* visibility: hidden removes the closed menu from the accessibility
             tree and tab order (its links were invisible focus targets).
             The transition keeps the fade-out: visibility flips only after
             the opacity animation completes. */
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .mobile-nav.active {
          opacity: 1;
          visibility: visible;
          pointer-events: all;
        }

        .mobile-nav :global(.mobile-nav-link) {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--deep-blue);
          text-decoration: none;
          transition: color 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
        }

        .mobile-nav.active :global(.mobile-nav-link) {
          animation: fadeInUp 0.5s ease forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-nav :global(.mobile-nav-link):hover {
          color: var(--brand-blue);
        }

        .mobile-nav-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        /* ≥44x44px tap target for the language switcher trigger (WCAG 2.5.8) */
        .mobile-nav-actions :global(.lang-toggle) {
          min-width: 44px;
          min-height: 44px;
          justify-content: center;
        }

        .mobile-nav :global(.nav-cta) {
          background: var(--brand-blue);
          color: white;
          padding: 0.8rem 1.8rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .mobile-nav :global(.nav-cta):hover {
          background: var(--brand-blue-dark);
        }

        @media (max-width: 992px) {
          .mobile-nav {
            display: flex;
          }
        }

        @media (max-width: 576px) {
          .mobile-nav :global(.mobile-nav-link) {
            font-size: 1.3rem;
          }
        }

        @media (max-height: 500px) and (orientation: landscape) {
          .mobile-nav {
            padding-top: 4rem;
            gap: 1rem;
          }

          .mobile-nav :global(.mobile-nav-link) {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
