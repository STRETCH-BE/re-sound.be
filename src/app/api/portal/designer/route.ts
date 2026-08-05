// CLIENT PORTAL — serves the ceiling designer app (single-file HTML) to
// signed-in portal users only. The app embeds the Stretch price matrix, so it
// must never be publicly reachable; it ships as a base64 module and is
// decoded per request. Rendered inside an <iframe> on /portal/designer.
import { NextRequest, NextResponse } from 'next/server';
import { getPortalSession } from '@/lib/portal/auth';
import { DESIGNER_HTML_B64 } from '@/lib/portal/designer-html';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getPortalSession();
  if (!session) {
    return NextResponse.redirect(new URL('/portal/login', request.url));
  }
  const html = Buffer.from(DESIGNER_HTML_B64, 'base64').toString('utf8');
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      // the designer is only meant to be embedded by our own portal page
      'X-Frame-Options': 'SAMEORIGIN',
    },
  });
}
