// ============================================================================
// CLIENT PORTAL — Supabase clients (server side only)
//
// Follows the repo's zero-config philosophy: with no Supabase env vars the
// portal runs in DEMO MODE (cookie session + bundled sample pricebook) so the
// whole flow can be previewed locally. Add the env vars to switch to real
// authentication + the live SQL database. See docs/PORTAL.md.
// ============================================================================
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || undefined;
}
export function supabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined;
}

/** True when the portal is wired to a real Supabase project. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

/**
 * Supabase client for Server Components (read-only cookies — token refresh
 * itself happens in middleware.ts, which CAN write cookies).
 */
export function createRscClient(): SupabaseClient {
  const store = cookies();
  return createServerClient(supabaseUrl()!, supabaseAnonKey()!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: () => {
        /* Server Components cannot write cookies — middleware handles refresh. */
      },
    },
  });
}

/**
 * Supabase client for Route Handlers (full cookie read/write — used by the
 * login/logout endpoints).
 */
export function createRouteClient(): SupabaseClient {
  const store = cookies();
  return createServerClient(supabaseUrl()!, supabaseAnonKey()!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
      },
    },
  });
}

/**
 * Service-role client — bypasses RLS. ONLY for admin API routes (pricebook
 * sync, account management) after the caller's admin role has been verified.
 * Requires SUPABASE_SERVICE_ROLE_KEY (server-only env var, never NEXT_PUBLIC).
 */
export function createServiceClient(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
