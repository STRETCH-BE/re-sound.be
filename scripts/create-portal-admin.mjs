#!/usr/bin/env node
// ============================================================================
// STRETCH CLIENT PORTAL — bootstrap the first admin account
//
//   node scripts/create-portal-admin.mjs admin@stretchgroup.be "SafePassword1!" "STRETCH HQ"
//
// Creates a confirmed Supabase auth user + an active `portal_users` profile
// with role=admin and all-markets visibility. Further accounts can then be
// created from the portal's own admin page.
//
// Required env vars (read from .env.local / .env when present):
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================================
import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

for (const envFile of ['.env.local', '.env']) {
  if (!existsSync(envFile)) continue;
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const [email, password, company = 'STRETCH'] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: node scripts/create-portal-admin.mjs <email> <password> [company]');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (error || !data.user) {
  console.error('Could not create auth user:', error?.message);
  process.exit(1);
}

const { error: profileError } = await supabase.from('portal_users').insert({
  id: data.user.id,
  email: email.toLowerCase(),
  company,
  role: 'admin',
  markets: [],
  all_markets: true,
  active: true,
});
if (profileError) {
  await supabase.auth.admin.deleteUser(data.user.id).catch(() => undefined);
  console.error('Could not create portal profile:', profileError.message);
  process.exit(1);
}

console.log(`Admin account ready: ${email} (all markets). Sign in at /portal/login.`);
