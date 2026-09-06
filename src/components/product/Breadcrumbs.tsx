import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

export interface Crumb {
  name: string;
  /** Root-relative path without locale, e.g. '/products'; omit for the current page */
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  /** Visual variant: 'overlay' floats over a hero, 'inline' sits in the flow */
  variant?: 'overlay' | 'inline';
}

/**
 * Visible breadcrumb trail (server component). The matching BreadcrumbList
 * JSON-LD is emitted by the page with the same items.
 */
export default async function Breadcrumbs({ items, variant = 'inline' }: BreadcrumbsProps) {
  const t = await getTranslations('hubs.shared');
  return (
    <nav className={`ps-breadcrumbs ps-breadcrumbs--${variant}`} aria-label={t('breadcrumbLabel')}>
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
