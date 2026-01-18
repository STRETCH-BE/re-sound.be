'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

type LocaleCode = 'en' | 'nl' | 'fr' | 'de';

const locales = [
  { code: 'en' as LocaleCode, name: 'English', flag: '🇬🇧' },
  { code: 'nl' as LocaleCode, name: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr' as LocaleCode, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as LocaleCode, name: 'Deutsch', flag: '🇩🇪' },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = locales.find((l) => l.code === locale) || locales[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLocaleChange = (newLocale: LocaleCode) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="lang-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span className="lang-flag">{currentLocale.flag}</span>
        <span className="lang-code">{currentLocale.code.toUpperCase()}</span>
        <svg
          className={`lang-arrow ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <ul
        className={`lang-dropdown ${isOpen ? 'open' : ''}`}
        role="listbox"
        aria-label="Select language"
      >
        {locales.map((loc) => (
          <li key={loc.code} role="option" aria-selected={loc.code === locale}>
            <button
              className={`lang-option ${loc.code === locale ? 'active' : ''}`}
              onClick={() => handleLocaleChange(loc.code)}
            >
              <span className="lang-flag">{loc.flag}</span>
              <span className="lang-code">{loc.code.toUpperCase()}</span>
              <span className="lang-name">{loc.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .language-switcher {
          position: relative;
        }

        .lang-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid var(--sand);
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--deep-blue);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .lang-toggle:hover {
          border-color: var(--brand-blue);
        }

        .lang-flag {
          font-size: 1rem;
        }

        .lang-code {
          font-weight: 600;
          font-size: 0.8rem;
        }

        .lang-arrow {
          transition: transform 0.3s ease;
        }

        .lang-arrow.open {
          transform: rotate(180deg);
        }

        .lang-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          list-style: none;
          padding: 0.5rem;
          min-width: 180px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 200;
        }

        .lang-dropdown.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .lang-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          border-radius: 10px;
          color: var(--charcoal);
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s ease;
          text-align: left;
        }

        .lang-option:hover {
          background: var(--cream);
        }

        .lang-option.active {
          background: var(--brand-blue-pale);
        }

        .lang-option.active .lang-code {
          color: var(--brand-blue);
        }

        .lang-option .lang-code {
          font-weight: 600;
          font-size: 0.8rem;
          min-width: 24px;
        }

        .lang-name {
          font-size: 0.9rem;
          color: var(--charcoal);
        }

        @media (max-width: 576px) {
          .lang-dropdown {
            right: auto;
            left: 50%;
            transform: translateX(-50%) translateY(-10px);
          }

          .lang-dropdown.open {
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
