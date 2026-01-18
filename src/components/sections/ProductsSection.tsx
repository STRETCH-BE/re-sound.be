'use client';

import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';

export default function ProductsSection() {
  const t = useTranslations('products');

  const products = [
    { 
      slug: 'interior', 
      image: '/images/products/interior/card.webp',
    },
    { 
      slug: 'solid', 
      image: '/images/products/solid/card.webp',
    },
    { 
      slug: 'divide', 
      image: '/images/products/divide/card.webp',
    },
  ];

  return (
    <section className="products-section">
      <div className="section-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>
        <p className="section-subtitle">{t('subtitle')}</p>
      </div>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.slug} {...product} />
        ))}
      </div>
    </section>
  );
}
