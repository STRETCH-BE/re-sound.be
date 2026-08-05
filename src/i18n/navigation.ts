import { createNavigation } from 'next-intl/navigation';
import { routing } from './config';

// Locale-aware navigation primitives, DOMAIN-aware via `routing.domains`.
// ALWAYS import Link/redirect/usePathname/useRouter from here — never from
// 'next/link' / 'next/navigation' — so locale handling (and, in dev, prefixing)
// happens automatically at the Link level. In production each domain serves a
// single locale, so links render without any prefix.
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
