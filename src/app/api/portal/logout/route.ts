// POST /api/portal/logout — ends the portal session (Supabase or demo cookie).
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteClient, isSupabaseConfigured } from '@/lib/portal/supabase';
import { DEMO_COOKIE } from '@/lib/portal/auth';

export const runtime = 'nodejs';

export async function POST() {
  if (isSupabaseConfigured()) {
    const supabase = createRouteClient();
    await supabase.auth.signOut();
  }
  cookies().delete(DEMO_COOKIE);
  return NextResponse.json({ ok: true });
}
