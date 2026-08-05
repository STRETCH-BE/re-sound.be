// POST /api/lead — receives every lead-modal submission and delivers it via the
// graceful multi-method sender. Sanitises strings, caps field count/length to
// resist abuse, and returns a minimal { ok }. Never logs submitted PII.
import { NextResponse } from 'next/server';
import { deliverLead } from '@/lib/deliver';
import type { LeadPayload } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FIELDS = 40;
const MAX_LEN = 5000;

function clean(value: unknown): string {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .slice(0, MAX_LEN)
    .trim();
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  // Honeypot: silently accept bot submissions without delivering.
  if (clean((body as Record<string, unknown>)._gotcha)) {
    return NextResponse.json({ ok: true });
  }

  const payload: LeadPayload = { source: clean(body.source) || 'unknown' };
  let count = 0;
  for (const [key, val] of Object.entries(body)) {
    if (key === 'source' || key === '_gotcha') continue;
    if (count >= MAX_FIELDS) break;
    const v = clean(val);
    if (v) {
      payload[key] = v;
      count++;
    }
  }

  // Require at least one contact handle.
  if (!payload.email && !payload.phone) {
    return NextResponse.json({ ok: false, error: 'missing_contact' }, { status: 422 });
  }

  try {
    await deliverLead(payload);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[lead] unexpected delivery error: ${err instanceof Error ? err.message : 'unknown'}`);
    return NextResponse.json({ ok: false, error: 'delivery_failed' }, { status: 502 });
  }
}
