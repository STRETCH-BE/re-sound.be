'use client';

// Meta (Facebook) Pixel. Gated on the MARKETING consent category. Disabled in
// the brand brief today (meta_pixel: no) — built per the locked spec and inert
// unless NEXT_PUBLIC_META_PIXEL_ID is set AND marketing consent is granted.
import { useEffect, useState } from 'react';
import { getConsent, CONSENT_UPDATE_EVENT, type ConsentPreferences } from '@/lib/consent';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(Boolean(getConsent()?.marketing));
    sync();
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPreferences>).detail;
      setAllowed(Boolean(detail?.marketing ?? getConsent()?.marketing));
    };
    window.addEventListener(CONSENT_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(CONSENT_UPDATE_EVENT, onUpdate);
  }, []);

  useEffect(() => {
    if (!PIXEL_ID || !allowed) return;
    if (document.getElementById('meta-pixel-script')) return;
    const s = document.createElement('script');
    s.id = 'meta-pixel-script';
    s.innerHTML = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(s);
  }, [allowed]);

  return null;
}
