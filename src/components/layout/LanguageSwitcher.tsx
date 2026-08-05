'use client';

// Language switcher — CROSS-DOMAIN aware. Every locale lives on its own
// domain, so in production switching languages means a full navigation to
// `https://<locale-domain><current-path>` (paths are identical across
// locales). On hosts that aren't in the domain map (localhost, Vercel
// previews) it falls back to next-intl's in-app locale switch so dev/QA
// keeps working without DNS.
import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { ChevronDown } from 'lucide-react';
import {
  locales,
  localeNames,
  localeFlags,
  localeForHost,
  originForLocale,
  type Locale,
} from '@/i18n/config';
import { analytics } from '@/lib/analytics';

export default function LanguageSwitcher({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname(); // locale-agnostic path, e.g. "/products"
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const color = tone === 'dark' ? 'rgba(255,255,255,.7)' : 'var(--text-muted)';

  function switchTo(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    analytics.languageSwitch(locale, next, pathname);

    // Production: the current host is a known locale domain → jump to the
    // target locale's domain, preserving the path (+ query string).
    const onKnownDomain =
      typeof window !== 'undefined' && localeForHost(window.location.host) !== null;
    if (onKnownDomain) {
      const search = window.location.search || '';
      window.location.assign(`${originForLocale(next)}${pathname === '/' ? '' : pathname}${search}`);
      return;
    }

    // Dev / preview: in-app switch via path prefix.
    router.replace(pathname, { locale: next });
  }

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color,
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
        }}
      >
        {locale.toUpperCase()}
        <ChevronDown size={12} />
      </button>
      {open && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            right: 0,
            top: '120%',
            background: '#fff',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            listStyle: 'none',
            margin: 0,
            padding: 6,
            minWidth: 190,
            maxHeight: 320,
            overflowY: 'auto',
            zIndex: 80,
          }}
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => switchTo(l)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  background: l === locale ? 'var(--surface)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '9px 12px',
                  fontSize: 13,
                  color: 'var(--text)',
                }}
              >
                <span aria-hidden>{localeFlags[l]}</span>
                {localeNames[l] ?? l}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
