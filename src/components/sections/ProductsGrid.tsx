'use client';

import ProductCard from './ProductCard';

interface ProductsGridProps {
  showAll?: boolean;
}

export default function ProductsGrid({ showAll = false }: ProductsGridProps) {
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
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.slug} {...product} />
      ))}
    </div>
  );
}
