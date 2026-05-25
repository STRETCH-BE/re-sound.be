'use client';

/**
 * Unified analytics tracking helper.
 *
 * Fires a single semantic event into GA4, Meta Pixel, Bing UET, and
 * Microsoft Clarity simultaneously. Each platform is presence-checked, so
 * calls become silent no-ops when:
 *   - the platform's env var isn't set,
 *   - the user hasn't granted the required consent category, or
 *   - the script failed to load (network blocked, ad-blocker, etc.).
 *
 * Two surfaces are exported:
 *   - `track(eventName, props)` — raw escape hatch for one-off events
 *   - `analytics.*` — typed wrappers covering the events the site actually
 *     fires (lead, contact, file_download, view_item, phone_click, etc.)
 *
 * The Clarity "custom tags" surface (`clarity('set', key, value)`) is also
 * filled in here automatically, so every event tagged via this helper
 * becomes a searchable filter in the Clarity dashboard.
 */

import { getConsent } from '@/lib/consent';

type Primitive = string | number | boolean | null | undefined;
type EventProps = Record<string, Primitive>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    uetq?: { push: (...args: unknown[]) => void } | unknown[];
    clarity?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Map our semantic event names to Meta Pixel's standard events. Anything
 * not in the map is skipped on Meta (custom events are noisy and rarely
 * useful for retargeting).
 */
const META_EVENT_MAP: Record<string, string> = {
  generate_lead: 'Lead',
  submit_lead_form: 'Lead',
  contact: 'Contact',
  file_download: 'ViewContent',
  view_item: 'ViewContent',
  sample_request: 'Lead',
};

export function track(eventName: string, props?: EventProps): void {
  if (typeof window === 'undefined') return;

  const safeProps: EventProps = props ? { ...props } : {};

  // ── GA4 ────────────────────────────────────────────────────────────────
  // Works even pre-consent: with Consent Mode v2 denied, GA4 still sends
  // cookieless modelled hits that feed conversion modelling.
  try {
    window.gtag?.('event', eventName, safeProps);
  } catch {
    /* no-op */
  }

  const consent = getConsent();
  const marketing = !!consent?.marketing;
  const analytics = !!consent?.analytics;

  // ── Meta Pixel ─────────────────────────────────────────────────────────
  if (marketing && typeof window.fbq === 'function') {
    const metaEvent = META_EVENT_MAP[eventName];
    if (metaEvent) {
      try {
        window.fbq('track', metaEvent, safeProps);
      } catch {
        /* no-op */
      }
    }
  }

  // ── Bing UET ───────────────────────────────────────────────────────────
  if (marketing && window.uetq && typeof (window.uetq as { push?: unknown }).push === 'function') {
    try {
      (window.uetq as { push: (...args: unknown[]) => void }).push(
        'event',
        eventName,
        safeProps
      );
    } catch {
      /* no-op */
    }
  }

  // ── Clarity custom tags ────────────────────────────────────────────────
  // Filterable in the dashboard — each non-null prop becomes a session tag.
  if (analytics && typeof window.clarity === 'function') {
    try {
      Object.entries(safeProps).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          window.clarity!('set', k, String(v));
        }
      });
    } catch {
      /* no-op */
    }
  }
}

/**
 * SHA-256 of a UTF-8 string using the Web Crypto API.
 * Used for Google Ads Enhanced Conversions for Leads — emails / phones
 * are hashed client-side before being attached to the conversion event.
 */
export async function sha256(input: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return '';
  const buf = new TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Send a hashed user identifier set to GA4 ahead of a conversion event.
 * Google Ads' Enhanced Conversions for Leads recovers attribution for
 * cross-device / post-cookie-expiry clicks. Only fires when the user has
 * granted marketing consent.
 */
export async function setEnhancedConversionsUserData(
  email?: string,
  phone?: string
): Promise<void> {
  if (typeof window === 'undefined') return;
  const consent = getConsent();
  if (!consent?.marketing) return;
  if (typeof window.gtag !== 'function') return;

  const userData: Record<string, string> = {};
  if (email) {
    const normalised = email.trim().toLowerCase();
    if (normalised) userData.sha256_email_address = await sha256(normalised);
  }
  if (phone) {
    // E.164-ish normalisation: keep digits + leading '+'
    const normalised = phone.startsWith('+')
      ? '+' + phone.slice(1).replace(/\D/g, '')
      : phone.replace(/\D/g, '');
    if (normalised) userData.sha256_phone_number = await sha256(normalised);
  }
  if (Object.keys(userData).length === 0) return;

  try {
    window.gtag('set', 'user_data', userData);
  } catch {
    /* no-op */
  }
}

/**
 * Typed wrappers for the canonical events. Names follow GA4's
 * recommended-event taxonomy where one exists.
 */
export const analytics = {
  /** GA4 recommended event — the canonical "lead captured" signal */
  generateLead: (data: { product: string; source: string; value?: number }) =>
    track('generate_lead', { ...data, currency: 'EUR' }),

  /** Contact-form / phone / email submission (separate from lead-gen modal) */
  submitContactForm: (success: boolean, topic?: string) =>
    track('contact', { method: 'form', success, topic }),

  /** PDF download triggered after lead-gen modal completion */
  fileDownload: (product: string, fileName: string) =>
    track('file_download', {
      product,
      file_name: fileName,
      file_extension: 'pdf',
    }),

  /** Sample-kit request from SampleKitModal */
  sampleRequest: (samples: string, productLines: string[]) =>
    track('sample_request', {
      samples,
      product_lines: productLines.join(','),
    }),

  /** Phone CTA click (tel: link) */
  phoneClick: (location: string) =>
    track('contact', { method: 'phone', location }),

  /** Email click (mailto: link) */
  emailClick: (location: string) =>
    track('contact', { method: 'email', location }),

  /** "Request a quote" / contact-page CTA click */
  quoteClick: (product?: string, location?: string) =>
    track('quote_click', { product, location }),

  /** Language switch — useful for understanding which locales convert */
  languageSwitch: (from: string, to: string, path: string) =>
    track('language_switch', { from, to, path }),

  /** Product page view — fires once per page on the product pages */
  viewItem: (product: string, category: string, price?: number) =>
    track('view_item', {
      item_name: product,
      item_category: category,
      price,
      currency: 'EUR',
    }),

  /** Scroll milestone reached (25 / 50 / 75 / 90) */
  scrollDepth: (percent: number, page: string) =>
    track('scroll', { percent_scrolled: percent, page }),
};
