'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const BING_UET_ID = process.env.NEXT_PUBLIC_BING_UET_ID;

export default function BingUET() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted') {
      setHasConsent(true);
    }

    const handleConsent = (e: CustomEvent) => {
      if (e.detail === 'accepted') {
        setHasConsent(true);
      }
    };

    window.addEventListener('consent-given', handleConsent as EventListener);
    return () => {
      window.removeEventListener('consent-given', handleConsent as EventListener);
    };
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
  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') return;

    if (typeof window !== 'undefined' && (window as any).uetq) {
      (window as any).uetq.push('event', eventName, params || {});
    }
  };

  const trackConversion = (action: string, category?: string, label?: string, value?: number) => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') return;

    if (typeof window !== 'undefined' && (window as any).uetq) {
      (window as any).uetq.push('event', action, {
        event_category: category,
        event_label: label,
        event_value: value,
      });
    }
  };

  return { trackEvent, trackConversion };
}
