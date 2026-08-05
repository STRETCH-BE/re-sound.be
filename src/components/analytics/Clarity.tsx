'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import {
  CONSENT_EVENT,
  getConsent,
  type ConsentPreferences,
} from '@/lib/consent';

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/**
 * Microsoft Clarity — session recording + heatmaps.
 *
 * Treated as analytics (not marketing) under GDPR — masks PII by default,
 * records UI behaviour for usability analysis.
 *
 * To enable: set NEXT_PUBLIC_CLARITY_ID in your Vercel env and add
 *   <Clarity />
 * to the layout alongside <GoogleAnalytics />.
 */
export default function Clarity() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const stored = getConsent();
    if (stored?.analytics) setHasConsent(true);

    const handleConsent = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPreferences>).detail;
      if (detail?.analytics) setHasConsent(true);
      else setHasConsent(false);
    };

    window.addEventListener(CONSENT_EVENT, handleConsent);
    return () => window.removeEventListener(CONSENT_EVENT, handleConsent);
  }, []);

  if (!hasConsent || !CLARITY_ID) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `}
    </Script>
  );
}
