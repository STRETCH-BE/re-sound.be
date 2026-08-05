'use client';

// Bing / Microsoft UET. Gated on the MARKETING consent category. Disabled in
// the brand brief today (bing_uet: no) — built per the locked spec and inert
// unless NEXT_PUBLIC_BING_UET_ID is set AND marketing consent is granted.
import { useEffect, useState } from 'react';
import { getConsent, CONSENT_UPDATE_EVENT, type ConsentPreferences } from '@/lib/consent';

const UET_ID = process.env.NEXT_PUBLIC_BING_UET_ID;

export default function BingUET() {
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
    if (!UET_ID || !allowed) return;
    if (document.getElementById('bing-uet-script')) return;
    const s = document.createElement('script');
    s.id = 'bing-uet-script';
    s.innerHTML = `
      (function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${UET_ID}"};
      o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,
      n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;
      s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},
      i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})
      (window,document,"script","//bat.bing.com/bat.js","uetq");
    `;
    document.head.appendChild(s);
  }, [allowed]);

  return null;
}
