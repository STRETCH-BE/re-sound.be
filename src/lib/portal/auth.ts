// ============================================================================
// CLIENT PORTAL — session resolution (Supabase auth OR zero-config demo mode)
// ============================================================================
import { cache } from 'react';
import { cookies } from 'next/headers';
import type { PortalSession } from './types';
import { createRscClient, isSupabaseConfigured } from './supabase';
import { DEMO_USERS } from './demo-users';

export const DEMO_COOKIE = 'stretch_portal_demo';

// Re-exported for server-side consumers (API routes); client components must
// import from './demo-users' directly to avoid pulling in next/headers.
export { DEMO_USERS, findDemoUser } from './demo-users';

function demoSessionFromCookie(): PortalSession | null {
  const raw = cookies().get(DEMO_COOKIE)?.value;
  if (!raw) return null;
  try {
    const email = Buffer.from(raw, 'base64url').toString('utf8');
    const user = DEMO_USERS.find((u) => u.email === email);
    if (!user) return null;
    const { password: _pw, ...profile } = user;
    return { profile, demo: true };
  } catch {
    return null;
  }
}

/**
 * Resolve the current portal session (Server Components / Route Handlers).
 * Returns null when not signed in, when the auth user has no portal profile,
 * or when the profile has been deactivated. Wrapped in React cache() so
 * layout + page in the same request share one lookup.
 */
export const getPortalSession = cache(async (): Promise<PortalSession | null> => {
  if (!isSupabaseConfigured()) return demoSessionFromCookie();

  const supabase = createRscClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('portal_users')
    .select('id, email, company, role, markets, all_markets, active')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !profile.active) return null;

  return {
    profile: {
      id: profile.id,
      email: profile.email,
      company: profile.company,
      role: profile.role === 'admin' ? 'admin' : 'client',
      markets: profile.markets ?? [],
      allMarkets: Boolean(profile.all_markets),
      active: true,
    },
    demo: false,
  };
});

/** Convenience guard for admin-only API routes. */
export async function getAdminSession(): Promise<PortalSession | null> {
  const session = await getPortalSession();
  return session && session.profile.role === 'admin' ? session : null;
}
