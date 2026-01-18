'use client';

import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
  currentSlug: string;
}

export default function RelatedProducts({ currentSlug }: RelatedProductsProps) {
  const t = useTranslations('products');

  const allProducts = [
    { slug: 'interior', image: '/images/products/interior/interior_card.webp' },
    { slug: 'solid', image: '/images/products/solid/solid_card.webp' },
    { slug: 'divide', image: '/images/products/divide/divide_card.webp' },
  ];

  const relatedProducts = allProducts.filter((p) => p.slug !== currentSlug);

  return (
    <section className="related-products">
      <div className="related-inner">
        <span className="section-tag">{t('relatedTag')}</span>
        <h2>{t('relatedTitle')}</h2>
        <div className="related-grid">
          {relatedProducts.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .related-products {
          padding: 6rem 4rem;
          background: var(--cream);
        }
        .related-inner {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }
        .related-inner h2 {
          font-size: 2rem;
          color: var(--deep-blue);
          margin: 0.5rem 0 3rem;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        @media (max-width: 768px) {
          .related-products {
            padding: 4rem 1.5rem;
          }
          .related-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
        }
        @media (max-width: 576px) {
          .related-products {
            padding: 3rem 1rem;
          }
        }
      `}</style>
    </section>
  );
}
