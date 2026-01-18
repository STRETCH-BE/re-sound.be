'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

interface ProductCardProps {
  slug: string;
  image: string;
}

export default function ProductCard({ slug, image }: ProductCardProps) {
  const t = useTranslations(`products.${slug}`);
  const tCommon = useTranslations('products');

  return (
    <div className="product-card">
      <div className="product-image">
        <Image
          src={image}
          alt={t('title')}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
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
