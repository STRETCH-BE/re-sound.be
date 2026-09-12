import { NextResponse } from 'next/server';

/**
 * Weekly refresh of the Google rating/reviews (vercel.json cron, Mondays
 * 06:00 UTC). The reviews are fetched at BUILD time only
 * (scripts/fetch-google-reviews.mjs in `prebuild` → content/google-reviews.json);
 * nothing in the render path calls the Places API. A serverless function
 * cannot write to the repository, so the weekly refresh is a redeploy: this
 * route calls the project's Deploy Hook (Vercel → Settings → Git → Deploy
 * Hooks, stored as VERCEL_DEPLOY_HOOK_URL) and the new build runs the fetch
 * script again. Without the hook the route reports what is missing and does
 * nothing. Protected with CRON_SECRET (Vercel sends it as a Bearer token).
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 });
  }
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ ok: false, error: 'GOOGLE_PLACES_API_KEY not set — the build keeps the committed reviews' }, { status: 200 });
  }
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    return NextResponse.json({ ok: false, error: 'VERCEL_DEPLOY_HOOK_URL not set — no redeploy triggered' }, { status: 200 });
  }
  try {
    const res = await fetch(hook, { method: 'POST' });
    return NextResponse.json({ ok: res.ok, status: res.status, triggeredAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'deploy hook failed' }, { status: 200 });
  }
}
