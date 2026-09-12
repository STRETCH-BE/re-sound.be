'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { HUBS, HUB_IDS, hubPath } from '@/data/hubs';
import { BOOTH_GUIDE, guidePath, isGuideLocale } from '@/data/guides';
import { MANUFACTURING_INTERNAL_PATH, isManufacturingLocale, manufacturingPath } from '@/data/manufacturing';
import { analytics } from '@/lib/analytics';

// Build the display list from config so adding a language only requires config.ts
const localeList = locales.map((code) => ({
  code,
  name: localeNames[code],
}));

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const tNav = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = localeList.find((l) => l.code === locale) || localeList[0];

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

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    // Fire analytics BEFORE navigating — the page transition can outrun the
    // event otherwise, and locale switches are a key conversion signal
    // (which language do paying B2B leads actually come from?).
    analytics.languageSwitch(locale, newLocale, pathname);
    // Range hubs have a different slug per locale: translate the path
    // instead of reusing the current one (which would 404 elsewhere).
    const hub = HUB_IDS.map((id) => HUBS[id]).find((h) => hubPath(h, locale) === pathname);
    // The price guide and the manufacturing page exist in some locales only:
    // switching to a locale without them lands on that locale's home instead
    // of a 404.
    const onGuide = pathname === BOOTH_GUIDE.internalPath || pathname === guidePath(locale);
    const onManufacturing = pathname === MANUFACTURING_INTERNAL_PATH || pathname === manufacturingPath(locale);
    let target = hub ? hubPath(hub, newLocale) : pathname;
    if (onGuide && !isGuideLocale(newLocale)) target = '/';
    if (onManufacturing && !isManufacturingLocale(newLocale)) target = '/';
    router.replace(target, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="lang-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={tNav('selectLanguage')}
      >
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
        aria-label={tNav('selectLanguage')}
      >
        {localeList.map((loc) => (
          <li key={loc.code} role="option" aria-selected={loc.code === locale}>
            <button
              className={`lang-option ${loc.code === locale ? 'active' : ''}`}
              onClick={() => handleLocaleChange(loc.code)}
            >
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
          max-height: 360px;
          overflow-y: auto;
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
