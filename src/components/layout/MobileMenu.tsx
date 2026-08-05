'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { href: string; label: string }[];
}

export default function MobileMenu({ isOpen, onClose, navLinks }: MobileMenuProps) {
  const t = useTranslations('nav');

  return (
    <div className={`mobile-nav ${isOpen ? 'active' : ''}`}>
      {navLinks.map((link, index) => (
        <Link
          key={link.href}
          href={link.href}
          className="mobile-nav-link"
          onClick={onClose}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {link.label}
        </Link>
      ))}

      <div className="mobile-nav-actions">
        <LanguageSwitcher />
        <Link href="/contact" className="nav-cta" onClick={onClose}>
          {t('cta')}
        </Link>
      </div>

      <style jsx>{`
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
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .mobile-nav.active {
          opacity: 1;
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
