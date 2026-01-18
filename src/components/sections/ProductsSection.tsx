'use client';

import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';

export default function ProductsSection() {
  const t = useTranslations('products');

  const products = [
    { slug: 'interior', gradient: 'blue' as const, icon: 'grid' as const },
    { slug: 'solid', gradient: 'dark' as const, icon: 'solid' as const },
    { slug: 'divide', gradient: 'accent' as const, icon: 'divide' as const },
  ];

  return (
    <section className="products">
      <div className="section-header">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.slug} {...product} />
        ))}
      </div>
    </section>
  );
}
