'use client';

import ProductCard from './ProductCard';

interface ProductsGridProps {
  showAll?: boolean;
}

export default function ProductsGrid({ showAll = false }: ProductsGridProps) {
  const products = [
    { 
      slug: 'interior', 
      image: '/images/products/interior/interior_card.webp',
    },
    { 
      slug: 'solid', 
      image: '/images/products/solid/solid_card.webp',
    },
    { 
      slug: 'divide', 
      image: '/images/products/divide/divide_card.webp',
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
