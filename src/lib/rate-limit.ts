import type { NextRequest } from 'next/server';

/**
 * Per-instance request throttle for the lead-generating API routes (the
 * same posture as /api/vat-check): a small in-memory sliding window keyed by
 * client IP, plus a same-origin check. Serverless instances do not share the
 * map, so this caps abuse per instance rather than globally — enough to stop
 * a naive loop from turning the lead inbox into a firehose.
 */
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

export function clientKey(request: NextRequest): string {
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

export function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) {
    Array.from(hits.keys()).forEach((k) => {
      const times = hits.get(k) ?? [];
      if (times.every((time) => now - time >= WINDOW_MS)) hits.delete(k);
    });
  }
  return recent.length > MAX_PER_WINDOW;
}

/** False when an Origin header is present and names another host. */
export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  let originHost = '';
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  return Boolean(host) && originHost === host;
}
