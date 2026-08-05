// Root layout. App Router requires a root layout with <html>/<body>; the
// locale-aware <html lang> + metadata live in [locale]/layout.tsx. This wires
// the self-hosted font CSS variables onto <html> and loads global styles.
import type { ReactNode } from 'react';
import { archivo } from './fonts';
import { defaultLocale, localeFullCodes } from '@/i18n/config';
import './globals.css';

// <html lang> is set to the default locale's BCP-47 code. The launch is
// English-only, so this is static; when nl/fr/de are enabled, derive lang
// per-request (middleware header or a [locale]-level <html>). See CHANGES.md.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={localeFullCodes[defaultLocale] ?? 'en'}
      className={`${archivo.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
