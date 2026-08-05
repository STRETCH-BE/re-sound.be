// POST /api/portal/login — signs a portal client in.
// Supabase mode: password auth + portal profile check (must exist + be active).
// Demo mode (no Supabase env): checks the built-in demo accounts and sets a
// plain demo cookie. Demo mode is a preview feature, not a security boundary.
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteClient, isSupabaseConfigured } from '@/lib/portal/supabase';
import { DEMO_COOKIE, findDemoUser } from '@/lib/portal/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let email = '';
  let password = '';
  try {
    const body = await req.json();
    email = String(body.email ?? '').trim();
    password = String(body.password ?? '');
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  // --- Demo mode -----------------------------------------------------------
  if (!isSupabaseConfigured()) {
    const user = findDemoUser(email, password);
    if (!user) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 401 });
    cookies().set(DEMO_COOKIE, Buffer.from(user.email, 'utf8').toString('base64url'), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8,
      path: '/',
    });
    return NextResponse.json({ ok: true, demo: true });
  }

  // --- Supabase mode -------------------------------------------------------
  const supabase = createRouteClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 401 });
  }

  // The auth user must also have an ACTIVE portal profile.
  const { data: profile } = await supabase
    .from('portal_users')
    .select('id, active')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!profile || !profile.active) {
    await supabase.auth.signOut();
    return NextResponse.json({ ok: false, error: 'inactive' }, { status: 403 });
  }

  return NextResponse.json({ ok: true, demo: false });
}
