/**
 * Google Consent Mode v2 — defaults.
 *
 * Renders a synchronous, inline <script> directly into <head>. Because it has
 * no `src` and no `async`/`defer`, the browser executes it immediately when
 * parsing the head, BEFORE any external scripts (like gtag.js) get a chance
 * to load. This is the only timing model that satisfies Google's requirement
 * that `gtag('consent', 'default', ...)` happens before `gtag('config', ...)`.
 *
 * We intentionally avoid `next/script` here: its `beforeInteractive` strategy
 * is only allowed in a root `app/layout.tsx`, which this project doesn't have
 * (the locale layout is effectively the root). A bare <script> works in any
 * Server Component layout and gives us the same execution-order guarantee.
 *
 * The script also reads any previously stored consent and `gtag('consent',
 * 'update', ...)` to apply it — so returning visitors don't get re-prompted.
 *
 * Match `CONSENT_VERSION` in src/lib/consent.ts. Bump both together if the
 * category structure changes.
 */
const CONSENT_DEFAULTS_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments)}
window.gtag = gtag;
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'functionality_storage': 'granted',
  'security_storage': 'granted',
  'wait_for_update': 500
});
try {
  var raw = window.localStorage.getItem('consent-preferences');
  if (raw) {
    var prefs = JSON.parse(raw);
    if (prefs && prefs.version === 1) {
      gtag('consent', 'update', {
        'analytics_storage': prefs.analytics ? 'granted' : 'denied',
        'ad_storage': prefs.marketing ? 'granted' : 'denied',
        'ad_user_data': prefs.marketing ? 'granted' : 'denied',
        'ad_personalization': prefs.marketing ? 'granted' : 'denied'
      });
    }
  }
} catch (e) { /* ignore */ }
`.trim();

export default function ConsentModeDefaults() {
  return (
    <script
      id="consent-mode-defaults"
      dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS_SCRIPT }}
    />
  );
}
