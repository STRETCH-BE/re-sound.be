'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface ProductCardProps {
  slug: string;
  gradient: 'blue' | 'dark' | 'accent';
  icon: 'grid' | 'solid' | 'divide';
}

const gradients = {
  blue: 'linear-gradient(135deg, var(--brand-blue-light), var(--brand-blue))',
  dark: 'linear-gradient(135deg, var(--brand-blue), var(--deep-blue))',
  accent: 'linear-gradient(135deg, var(--accent), #229687)',
};

const icons = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  solid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  divide: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  ),
};

export default function ProductCard({ slug, gradient, icon }: ProductCardProps) {
  const t = useTranslations(`products.${slug}`);
  const tCommon = useTranslations('products');

  return (
    <div className="product-card">
      <div className="product-image" style={{ background: gradients[gradient] }}>
        <div className="product-icon">{icons[icon]}</div>
      </div>
      <div className="product-content">
        <h3>{t('title')}</h3>
        <p>{t('description')}</p>
        <Link href={`/products/${slug}`} className="product-link">
          {tCommon('learnMore')}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
