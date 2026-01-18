'use client';

import ProductCard from './ProductCard';

interface ProductsGridProps {
  showAll?: boolean;
}

export default function ProductsGrid({ showAll = false }: ProductsGridProps) {
  const products = [
    { slug: 'interior', gradient: 'blue' as const, icon: 'grid' as const },
    { slug: 'solid', gradient: 'dark' as const, icon: 'solid' as const },
    { slug: 'divide', gradient: 'accent' as const, icon: 'divide' as const },
  ];

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.slug} {...product} />
      ))}
    </div>
  );
}
