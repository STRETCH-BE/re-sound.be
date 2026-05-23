'use client';

import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Google Analytics 4 with Consent Mode v2.
 *
 * Unlike the previous "load only after consent" pattern, this component loads
 * gtag.js on every page. Tracking behaviour is gated entirely by Consent Mode:
 * when `analytics_storage` is 'denied' (the default), GA sends cookieless
 * pings that Google uses for modelled conversions and aggregate reporting,
 * but no client identifier is set.
 *
 * The consent defaults are set in <ConsentModeDefaults />, which MUST render
 * before this component (it does, via `beforeInteractive` vs `afterInteractive`).
 */
export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
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
