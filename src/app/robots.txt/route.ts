// ============================================================================
// HOST-AWARE robots.txt
// Each of the 12 locale domains must advertise ITS OWN sitemap URL, so this
// replaces the old static public/robots.txt with a route handler that reads
// the Host header. Crawl policy is identical everywhere: search and AI
// crawlers explicitly welcome; only /api/ disallowed.
// ============================================================================
import { defaultLocale, localeForHost, originForLocale } from '@/i18n/config';

export const dynamic = 'force-dynamic';

const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
  'cohere-ai',
];

export function GET(request: Request) {
  const host = request.headers.get('host');
  const locale = localeForHost(host);
  // Known domain → that domain's sitemap; unknown host (preview) → default.
  const origin = locale ? originForLocale(locale) : originForLocale(defaultLocale);

  const body = [
    '# robots.txt — STRETCH (host-aware, one locale per domain)',
    '# Search and AI crawlers are explicitly welcome; only the API is disallowed.',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '# Client portal — private, login-gated area (also served noindex).',
    'Disallow: /portal',
    'Disallow: /*/portal',
    '',
    '# --- AI / LLM crawlers (explicitly allowed) ---',
    ...AI_CRAWLERS.flatMap((ua) => [`User-agent: ${ua}`, 'Allow: /', '']),
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
