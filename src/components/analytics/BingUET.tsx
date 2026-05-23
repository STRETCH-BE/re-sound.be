'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import {
  CONSENT_EVENT,
  getConsent,
  type ConsentPreferences,
} from '@/lib/consent';

const BING_UET_ID = process.env.NEXT_PUBLIC_BING_UET_ID;

/**
 * Bing Universal Event Tracking.
 *
 * Loads only after the user grants `marketing` consent. UET also supports a
 * consent signal via `window.uetq.push('consent', 'update', { ad_storage: ... })`
 * which we could add later — for now, gating the script entirely is sufficient
 * and the simpler compliance posture.
 */
export default function BingUET() {
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

  if (!hasConsent || !BING_UET_ID) return null;

  return (
    <Script id="bing-uet" strategy="afterInteractive">
      {`
        (function(w,d,t,r,u){
          var f,n,i;
          w[u]=w[u]||[],f=function(){
            var o={ti:"${BING_UET_ID}"};
            o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")
          },
          n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){
            var s=this.readyState;
            s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)
          },
          i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)
        })(window,document,"script","//bat.bing.com/bat.js","uetq");
      `}
    </Script>
  );
}

// Helper hook for Bing UET events
export function useBingUET() {
  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    const stored = getConsent();
    if (!stored?.marketing) return;
    const w = window as unknown as { uetq?: { push: (...args: unknown[]) => void } };
    if (w.uetq) {
      w.uetq.push('event', eventName, params || {});
    }
  };

  const trackConversion = (
    action: string,
    category?: string,
    label?: string,
    value?: number
  ) => {
    if (typeof window === 'undefined') return;
    const stored = getConsent();
    if (!stored?.marketing) return;
    const w = window as unknown as { uetq?: { push: (...args: unknown[]) => void } };
    if (w.uetq) {
      w.uetq.push('event', action, {
        event_category: category,
        event_label: label,
        event_value: value,
      });
    }
  };

  return { trackEvent, trackConversion };
}
