/**
 * Granular cookie-consent state.
 *
 * Three categories:
 *  - necessary  (always true; site cannot function without them)
 *  - analytics  (GA4, Microsoft Clarity, etc.)
 *  - marketing  (Meta Pixel, Bing UET, retargeting)
 *
 * Persisted in localStorage as JSON under `consent-preferences`.
 * Change-events are broadcast on `window` as `CustomEvent<ConsentPreferences>`
 * named `consent-update`. Components listen for that event AND read the stored
 * value on mount.
 *
 * NOTE: the layout also writes a small inline script that calls
 * `gtag('consent', 'default'/'update', ...)` directly from this same
 * localStorage value, so the consent state must remain stable across reloads.
 *
 * Version bumps invalidate stored consent and prompt the user again — bump
 * `CONSENT_VERSION` whenever categories change.
 */

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = 'consent-preferences';
export const CONSENT_EVENT = 'consent-update';
export const CONSENT_OPEN_EVENT = 'consent-open-banner';

export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: number;
  timestamp: number;
}

export function getConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentPreferences;
    // Invalidate if version doesn't match current categories
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setConsent(
  preferences: Omit<ConsentPreferences, 'necessary' | 'version' | 'timestamp'>
): ConsentPreferences {
  const full: ConsentPreferences = {
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    version: CONSENT_VERSION,
    timestamp: Date.now(),
  };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(full));
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: full }));
    // Push to Google Consent Mode v2 if gtag has loaded
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('consent', 'update', {
        analytics_storage: full.analytics ? 'granted' : 'denied',
        ad_storage: full.marketing ? 'granted' : 'denied',
        ad_user_data: full.marketing ? 'granted' : 'denied',
        ad_personalization: full.marketing ? 'granted' : 'denied',
      });
    }
  }
  return full;
}

export function openConsentBanner(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}
