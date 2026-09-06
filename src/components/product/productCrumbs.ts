import { getTranslations } from 'next-intl/server';

import { hubForFamily, hubPath } from '@/data/hubs';
import { PRODUCTS } from '@/data/products';
import type { BreadcrumbItem } from '@/lib/structured-data';

import type { Crumb } from './Breadcrumbs';

/**
 * Home › Products › <range hub> › <model> for a product page. The same
 * items feed the visible trail (<Breadcrumbs />) and the BreadcrumbList
 * JSON-LD, so the two can never drift apart. Textile products have no
 * range hub and get a three-level trail.
 */
export async function productCrumbs(locale: string, slug: string, name: string): Promise<Crumb[]> {
  const t = await getTranslations({ locale });
  const hub = hubForFamily(PRODUCTS[slug].family);
  const crumbs: Crumb[] = [
    { name: t('hubs.shared.breadcrumbHome'), href: '/' },
    { name: t('products.pageTitle'), href: '/products' },
  ];
  if (hub) crumbs.push({ name: t(`hubs.${hub.id}.breadcrumb`), href: hubPath(hub, locale) });
  crumbs.push({ name, href: `/products/${slug}` });
  return crumbs;
}

/** Root-relative crumb hrefs → locale-prefixed URLs for breadcrumbSchema(). */
export function crumbsToSchema(locale: string, crumbs: Crumb[]): BreadcrumbItem[] {
  return crumbs.map((c) => ({
    name: c.name,
    url: `/${locale}${!c.href || c.href === '/' ? '' : c.href}`,
  }));
}
