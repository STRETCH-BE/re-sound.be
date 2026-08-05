// ============================================================================
// ANALYTICS — one track() that fires into every active platform, plus typed
// wrappers for the canonical event taxonomy. Consent-aware: marketing
// platforms (Meta, Bing) only fire when marketing consent is granted; GA is
// gated by Consent Mode v2 (so it always loads and sends modelled hits).
// ============================================================================
import { getConsent } from '@/lib/consent';

// Browser globals injected by third-party scripts. Typed loosely on purpose.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    uetq?: unknown[] & { push?: (...args: unknown[]) => void };
    clarity?: (...args: unknown[]) => void;
  }
}

export type EventProps = Record<string, string | number | boolean | undefined>;

export function track(eventName: string, props?: EventProps): void {
  if (typeof window === 'undefined') return;

  // GA4 — Consent Mode handles gating, so always attempt to send.
  try {
    window.gtag?.('event', eventName, props || {});
  } catch {
    /* no-op */
  }

  const consent = getConsent();

  if (consent?.marketing) {
    // Map our taxonomy to Meta's standard events.
    const metaMap: Record<string, string> = {
      generate_lead: 'Lead',
      contact: 'Contact',
      view_item: 'ViewContent',
      sample_request: 'Lead',
      quote_click: 'Lead',
    };
    try {
      if (window.fbq && metaMap[eventName]) {
        window.fbq('track', metaMap[eventName], props || {});
      }
    } catch {
      /* no-op */
    }
    try {
      window.uetq?.push?.('event', eventName, props || {});
    } catch {
      /* no-op */
    }
  }

  // Clarity custom tags (Clarity itself is gated on the analytics category at
  // load time; setting tags is harmless if it failed to load).
  try {
    if (typeof window.clarity === 'function' && props) {
      for (const [k, v] of Object.entries(props)) {
        if (v != null) window.clarity('set', k, String(v));
      }
    }
  } catch {
    /* no-op */
  }
}

// ---------------------------------------------------------------------------
// Typed wrappers — the canonical events. Wire these into components directly.
// ---------------------------------------------------------------------------
export const analytics = {
  generateLead(p: { product?: string; source: string }) {
    track('generate_lead', { product: p.product, source: p.source });
  },
  submitContactForm(success: boolean) {
    track('contact', { success });
  },
  fileDownload(product: string, fileName: string) {
    track('file_download', { product, file_name: fileName });
  },
  sampleRequest(samples: string, productLines: string) {
    track('sample_request', { samples, product_lines: productLines });
  },
  phoneClick(location: string) {
    track('phone_click', { location });
  },
  emailClick(location: string) {
    track('email_click', { location });
  },
  whatsappClick(location: string) {
    track('whatsapp_click', { location });
  },
  quoteClick(product: string | undefined, location: string) {
    track('quote_click', { product, location });
  },
  languageSwitch(from: string, to: string, path: string) {
    track('language_switch', { from, to, path });
  },
  viewItem(product: string, category: string, price?: number) {
    track('view_item', { product, category, price });
  },
  scrollDepth(percent: number, page: string) {
    track('scroll_depth', { percent, page });
  },
};

// ---------------------------------------------------------------------------
// Enhanced Conversions helpers (Google Ads) — SHA-256 via Web Crypto.
// ---------------------------------------------------------------------------
export async function sha256(value: string): Promise<string> {
  const buf = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  return digits ? `+${digits}` : '';
}
