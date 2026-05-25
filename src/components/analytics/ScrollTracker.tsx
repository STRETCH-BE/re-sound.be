'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics';

/**
 * Fires `scroll` events at 25 / 50 / 75 / 90 % page depth.
 *
 * Mounted once in the locale layout. Resets on every pathname change so
 * scroll depth is measured per page, not per session — milestone-once
 * firing means the event only fires the first time a milestone is reached
 * on a given page.
 *
 * Passive scroll listener; cleans up on unmount + route change.
 */
const MILESTONES = [25, 50, 75, 90] as const;

export default function ScrollTracker() {
  const pathname = usePathname();
  const fired = useRef<Set<number>>(new Set());

  // Reset the fired-set whenever the route changes
  useEffect(() => {
    fired.current = new Set();
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (max <= 0) return;
      const pct = Math.round((h.scrollTop / max) * 100);
      MILESTONES.forEach((m) => {
        if (pct >= m && !fired.current.has(m)) {
          fired.current.add(m);
          analytics.scrollDepth(m, pathname);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return null;
}
