import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

export interface Crumb {
  name: string;
  /** Root-relative path without locale, e.g. '/products'; omit for the current page */
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

/**
 * Visible breadcrumb trail (server component). The matching BreadcrumbList
 * JSON-LD is emitted by the page with the same items.
 *
 * The trail sits in the normal flow at the top of the hero content. It used
 * to float over the hero, which put it in the same band as the product tag
 * (and under the fixed header, so its links could not be clicked).
 */
export default async function Breadcrumbs({ items }: BreadcrumbsProps) {
  const t = await getTranslations('hubs.shared');
  return (
    <nav className="ps-breadcrumbs" aria-label={t('breadcrumbLabel')}>
      <ol>
        {items.map((item, i) => (
          <li key={i}>
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} prefetch={false}>{item.name}</Link>
            ) : (
              <span aria-current="page">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
