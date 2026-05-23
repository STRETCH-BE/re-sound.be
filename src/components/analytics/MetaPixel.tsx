'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import {
  CONSENT_EVENT,
  getConsent,
  type ConsentPreferences,
} from '@/lib/consent';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Meta (Facebook) Pixel.
 *
 * Meta does not support Google's Consent Mode v2 directly, so the pixel
 * still uses the load-only-after-consent pattern. Gated on the `marketing`
 * category from <CookieConsent />.
 */
export default function MetaPixel() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const stored = getConsent();
    if (stored?.marketing) setHasConsent(true);

    const handleConsent = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPreferences>).detail;
      if (detail?.marketing) setHasConsent(true);
      else setHasConsent(false);
    };

    window.addEventListener(CONSENT_EVENT, handleConsent);
    return () => window.removeEventListener(CONSENT_EVENT, handleConsent);
  }, []);

  if (!hasConsent || !META_PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Helper hook for Meta Pixel events
export function useMetaPixel() {
  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    const stored = getConsent();
    if (!stored?.marketing) return;
    const w = window as unknown as { fbq?: (...args: unknown[]) => void };
    if (typeof w.fbq === 'function') {
      w.fbq('track', eventName, params);
    }
  };

  const trackCustomEvent = (
    eventName: string,
    params?: Record<string, unknown>
  ) => {
    if (typeof window === 'undefined') return;
    const stored = getConsent();
    if (!stored?.marketing) return;
    const w = window as unknown as { fbq?: (...args: unknown[]) => void };
    if (typeof w.fbq === 'function') {
      w.fbq('trackCustom', eventName, params);
    }
  };

  return { trackEvent, trackCustomEvent };
}
