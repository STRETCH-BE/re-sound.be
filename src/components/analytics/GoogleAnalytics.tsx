'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check for existing consent
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted') {
      setHasConsent(true);
    }

    // Listen for consent event
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

  // Don't load if no consent or no GA ID
  if (!hasConsent || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Helper hook for tracking events
export function useGoogleAnalytics() {
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') return;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  const trackPageView = (path: string) => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') return;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', GA_ID, {
        page_path: path,
      });
    }
  };

  return { trackEvent, trackPageView };
}
