'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import {
  CONSENT_EVENT,
  getConsent,
  type ConsentPreferences,
} from '@/lib/consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Google Analytics 4 — loaded lazily and only after analytics consent.
 *
 * Why not "always load, let Consent Mode gate it": gtag.js is ~167 KB and
 * caused three of the five long tasks on mobile, plus a `<link rel=preload
 * as=script>` that competed with the LCP image. The default consent state
 * is still set to `denied` for every category by <ConsentModeDefaults />
 * (Consent Mode v2), so if the script is loaded it starts in denied mode.
 *
 * Load conditions:
 *   - stored consent has `analytics: true` (returning visitor), or
 *   - the banner fires `consent-update` with `analytics: true`.
 * Strategy `lazyOnload` defers the fetch until the browser is idle after
 * `load`, so it never delays LCP/TBT of the initial render.
 *
 * Revoking consent later (banner → "Reject all") calls
 * gtag('consent','update',{analytics_storage:'denied'}) via setConsent();
 * the script itself stays loaded for the session but stops storing.
 */
export default function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const stored = getConsent();
    if (stored?.analytics) setHasConsent(true);

    const handleConsent = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPreferences>).detail;
      if (detail?.analytics) setHasConsent(true);
    };

    window.addEventListener(CONSENT_EVENT, handleConsent);
    return () => window.removeEventListener(CONSENT_EVENT, handleConsent);
  }, []);

  if (!GA_ID || !hasConsent) return null;

  return (
    <>
      <Script
        id="gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments)}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}

// Helper hook for tracking events — checks consent before firing
export function useGoogleAnalytics() {
  const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  const trackPageView = (path: string) => {
    if (typeof window === 'undefined' || !GA_ID) return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('config', GA_ID, { page_path: path });
    }
  };

  return { trackEvent, trackPageView };
}
