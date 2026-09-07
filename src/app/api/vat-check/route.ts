import { NextRequest, NextResponse } from 'next/server';

import { isVatNumberFormatValid, normaliseVatNumber, splitVatNumber, SHIP_FROM_COUNTRY, isEuCountry } from '@/lib/order/vat';
import { checkVatNumber } from '@/lib/order/vies';

/**
 * VAT number check for the order dialog.
 *
 * The dialog calls this while the buyer fills in their VAT number so the total
 * it shows is the total the order route will bill: only a number VIES confirms
 * gets the reverse charge, and the buyer sees that before consenting instead
 * of being surprised by the invoice.
 */

export const runtime = 'nodejs';
// One VIES round trip with a 6 s ceiling of its own.
export const maxDuration = 15;

const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function clientKey(request: NextRequest): string {
  const direct = (request as NextRequest & { ip?: string }).ip;
  if (direct) return direct;
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded.split(',').map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return 'unknown';
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) {
    Array.from(hits.keys()).forEach((k) => {
      const times = hits.get(k) ?? [];
      if (times.every((time: number) => now - time >= WINDOW_MS)) hits.delete(k);
    });
  }
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  try {
    // Same-origin only. Without this the endpoint is an open VIES proxy, and
    // exhausting the rate limit from outside would push every real business
    // order back to 23 % VAT.
    const origin = request.headers.get('origin');
    if (origin) {
      const host = request.headers.get('host');
      let originHost = '';
      try {
        originHost = new URL(origin).host;
      } catch {
        originHost = '';
      }
      if (!host || originHost !== host) return NextResponse.json({ status: 'unverified' }, { status: 403 });
    }

    if (rateLimited(clientKey(request))) {
      return NextResponse.json({ status: 'unverified' }, { status: 429 });
    }

    const body = (await request.json()) as { vatNumber?: string };
    const raw = typeof body.vatNumber === 'string' ? body.vatNumber.slice(0, 64) : '';
    const vatNumber = normaliseVatNumber(raw).slice(0, 20);

    if (!vatNumber) return NextResponse.json({ status: 'empty' });

    if (!isVatNumberFormatValid(vatNumber)) return NextResponse.json({ status: 'format_invalid' });

    const country = splitVatNumber(vatNumber)?.country ?? null;
    // A Polish number cannot carry the reverse charge: Poland is where the
    // goods start, so those orders stay domestic.
    if (!country || country === SHIP_FROM_COUNTRY || !isEuCountry(country)) {
      return NextResponse.json({ status: 'not_eligible', country });
    }

    const vies = await checkVatNumber(vatNumber);
    if (!vies.checked) return NextResponse.json({ status: 'unverified', country });
    if (!vies.valid) return NextResponse.json({ status: 'invalid', country });
    return NextResponse.json({ status: 'valid', country, name: vies.name ?? null });
  } catch {
    return NextResponse.json({ status: 'unverified' });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
