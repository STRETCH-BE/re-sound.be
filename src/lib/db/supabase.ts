/**
 * Server-side Supabase client for the catalogue and the order functions.
 *
 * SERVER ONLY. The keys stay in process.env on the server; `import
 * 'server-only'` below makes a client-component import fail the build, so
 * the key can never be inlined into a browser bundle. Server components,
 * route handlers and scripts are the only callers.
 *
 * Variables: SUPABASE_URL and SUPABASE_ANON_KEY (no NEXT_PUBLIC_ prefix —
 * nothing in the browser needs them). The older NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY names are still read as a fallback so an
 * environment configured before the rename keeps working.
 *
 * Which key: the service role key when it is set (production, so the
 * catalogue read is not subject to RLS quirks and place_order runs with full
 * rights), else the anon key — enough for the four public catalogue tables
 * and for the two SECURITY DEFINER functions.
 *
 * Every request goes through fetchWithTimeout: a page render must never hang
 * on the database. When the host does not answer within FETCH_TIMEOUT_MS the
 * call rejects and the caller falls back (src/lib/catalogue/load.ts uses the
 * committed snapshot).
 */
import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Hard ceiling on one database round trip. */
export const FETCH_TIMEOUT_MS = 4_000;

/** Named in log lines when the environment is not configured. */
export const ENV_HINT = 'SUPABASE_URL / SUPABASE_ANON_KEY not set';

function url(): string | undefined {
  return process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

function key(): { value: string; role: 'service_role' | 'anon' } | undefined {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (service) return { value: service, role: 'service_role' };
  const anon = process.env.SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (anon) return { value: anon, role: 'anon' };
  return undefined;
}

/** True when a URL and at least one key are present in the environment. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url() && key());
}

/** Which key createServerClient() would use — for logs and health checks only. */
export function supabaseRole(): 'service_role' | 'anon' | null {
  return key()?.role ?? null;
}

/**
 * fetch with an AbortController that fires after FETCH_TIMEOUT_MS. A signal
 * the caller passed is honoured as well: whichever aborts first wins.
 */
export function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error(`supabase: no answer within ${FETCH_TIMEOUT_MS} ms`)),
    FETCH_TIMEOUT_MS,
  );
  const outer = init?.signal;
  if (outer) {
    if (outer.aborted) controller.abort(outer.reason);
    else outer.addEventListener('abort', () => controller.abort(outer.reason), { once: true });
  }
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * A fresh client, or null when the environment is not configured. Cheap to
 * create (no network until the first query), so callers need not cache it.
 */
export function createServerClient(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    throw new Error('src/lib/db/supabase.ts is server-only; do not import it from a client component');
  }
  const u = url();
  const k = key();
  if (!u || !k) return null;
  return createClient(u, k.value, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: fetchWithTimeout },
  });
}
