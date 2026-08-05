// POST /api/contact — the standalone contact-page form. Same delivery pipeline
// as /api/lead, tagged with source "contact". Kept as its own endpoint so the
// contact form and the lead modal can evolve independently.
import { NextResponse } from 'next/server';
import { deliverLead } from '@/lib/deliver';
import type { LeadPayload } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  if (clean(body._gotcha)) {
    return NextResponse.json({ ok: true });
  }

  const email = clean(body.email);
  const name = clean(body.name);
  if (!email && !clean(body.phone)) {
    return NextResponse.json({ ok: false, error: 'missing_contact' }, { status: 422 });
  }

  const payload: LeadPayload = {
    source: 'contact',
    name,
    email,
    phone: clean(body.phone),
    subject: clean(body.subject),
    timeline: clean(body.timeline),
    message: clean(body.message),
  };

  try {
    await deliverLead(payload);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[contact] unexpected delivery error: ${err instanceof Error ? err.message : 'unknown'}`);
    return NextResponse.json({ ok: false, error: 'delivery_failed' }, { status: 502 });
  }
}
