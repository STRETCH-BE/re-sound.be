// CLIENT PORTAL — shared layout for /portal/*.
// Only sets metadata: portal pages are private, so they are never indexed and
// never appear in the sitemap. The auth gate lives in ./(app)/layout.tsx so
// the login page stays reachable when signed out.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/page-meta';

// Portal pages are private and session-dependent: always render per request,
// never prerender/cache (applies to every route below /portal).
export const dynamic = 'force-dynamic';

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMetadata({
    locale: params.locale,
    route: '/portal',
    titleKey: 'portalTitle',
    descKey: 'portalDescription',
    index: false,
  });
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  return children;
}
