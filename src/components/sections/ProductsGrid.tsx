'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';

// ============================================
// FILTER CONFIGURATION - Easy to extend
// ============================================
const filterCategories = [
  {
    id: 'finish',
    labelKey: 'filters.finish',
    options: [
      { id: 'textile', labelKey: 'filters.textile' },
      { id: 'wood', labelKey: 'filters.wood' },
      { id: 'pet', labelKey: 'filters.pet' },
    ],
  },
  {
    id: 'type',
    labelKey: 'filters.type',
    options: [
      { id: 'wall-panel', labelKey: 'filters.wallPanel' },
      { id: 'ceiling-panel', labelKey: 'filters.ceilingPanel' },
      { id: 'divider', labelKey: 'filters.divider' },
    ],
  },
];

// ============================================
// PRODUCTS DATA - Add tags here
// ============================================
const products = [
  { 
    slug: 'interior', 
    image: '/images/products/interior/interior_card.webp',
    tags: {
      finish: ['textile'],
      type: ['wall-panel'],
    },
  },
  { 
    slug: 'solid', 
    image: '/images/products/solid/solid_card.webp',
    tags: {
      finish: ['textile'],
      type: ['wall-panel'],
    },
  },
  { 
    slug: 'divide', 
    image: '/images/products/divide/divide_card.webp',
    tags: {
      finish: ['textile'],
      type: ['divider'],
    },
  },
  { 
    slug: 'rWood - Groove', 
    image: '/images/products/rwood-groove/hero-rWood-Groove.webp',
    tags: {
      finish: ['wood'],
      type: ['wall-panel', 'ceiling-panel'],
    },
  },
  {
    slug: 'rPET - Groove', 
    image: '/images/products/rpet-groove/hero-rpet-groove.webp',
    tags: {
      finish: ['pet'],
      type: ['wall-panel', 'ceiling-panel'],
    },
  },
  { 
    slug: 'rPET - Panel', 
    image: '/images/products/rpet-panel/hero-rPET-Flat.webp',
    tags: {
      finish: ['pet'],
      type: ['wall-panel', 'ceiling-panel'],
    },
  },
  { 
    slug: 'rPET - Circle', 
    image: '/images/products/rpet-circle/hero-rPET-Ceiling-Circle-grey.webp',
    tags: {
      finish: ['wood'],
      type: ['wall-panel', 'ceiling-panel'],
    },
  },
  { 
    slug: 'rPET - divide', 
    image: '/images/products/rpet-divide/hero-rPET-Flat-motiv-1-divider-hang.webp',
    tags: {
      finish: ['wood'],
      type: ['divider'],
    },
  },
  // Add more products here with their tags
  // Example:
  // { 
  //   slug: 'rwood', 
  //   image: '/images/products/rwood/rwood_card.webp',
  //   tags: {
  //     finish: ['wood'],
  //     type: ['wall-panel'],
  //   },
  // },
];

interface ProductsGridProps {
  showAll?: boolean;
}

export default function ProductsGrid({ showAll = false }: ProductsGridProps) {
  const t = useTranslations('products');
  
  // Active filters state: { finish: ['textile'], type: [] }
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    filterCategories.forEach(cat => {
      initial[cat.id] = [];
    });
    return initial;
  });

  // Toggle a filter option
  const toggleFilter = (categoryId: string, optionId: string) => {
    setActiveFilters(prev => {
      const current = prev[categoryId] || [];
      const isActive = current.includes(optionId);
      
      return {
        ...prev,
        [categoryId]: isActive
          ? current.filter(id => id !== optionId)
          : [...current, optionId],
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    const cleared: Record<string, string[]> = {};
    filterCategories.forEach(cat => {
      cleared[cat.id] = [];
    });
    setActiveFilters(cleared);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);

  // Filter products based on active filters
  const filteredProducts = products.filter(product => {
    // If no filters active, show all
    if (!hasActiveFilters) return true;

    // Product must match ALL active filter categories (AND between categories)
    // Within a category, product must match AT LEAST ONE selected option (OR within category)
    return filterCategories.every(category => {
      const activeOptions = activeFilters[category.id] || [];
      
      // If no options selected in this category, don't filter by it
      if (activeOptions.length === 0) return true;
      
      // Check if product has any of the selected options
      const productTags = product.tags[category.id as keyof typeof product.tags] || [];
      return activeOptions.some(option => productTags.includes(option));
    });
  });

  return (
    <div className="products-grid-container">
      {/* Filter Section */}
      <div className="products-filters">
        <div className="filters-header">
          <h3>{t('filters.title')}</h3>
          {hasActiveFilters && (
            <button className="clear-filters" onClick={clearFilters}>
              {t('filters.clear')}
            </button>
          )}
        </div>

        {filterCategories.map(category => (
          <div key={category.id} className="filter-group">
            <h4>{t(category.labelKey)}</h4>
            <div className="filter-options">
              {category.options.map(option => {
                const isActive = activeFilters[category.id]?.includes(option.id);
                return (
                  <button
                    key={option.id}
                    className={`filter-chip ${isActive ? 'active' : ''}`}
                    onClick={() => toggleFilter(category.id, option.id)}
                  >
                    {t(option.labelKey)}
                    {isActive && (
                      <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Results count */}
      <div className="products-results-info">
        <span>
          {filteredProducts.length === products.length
            ? t('filters.showingAll', { count: products.length })
            : t('filters.showingFiltered', { filtered: filteredProducts.length, total: products.length })
          }
        </span>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.slug} slug={product.slug} image={product.image} />
          ))
        ) : (
          <div className="no-results">
            <p>{t('filters.noResults')}</p>
            <button className="clear-filters-link" onClick={clearFilters}>
              {t('filters.clearAndShowAll')}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .products-grid-container {
          width: 100%;
        }

        .products-filters {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .filters-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0A1628;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .clear-filters {
          background: none;
          border: none;
          color: #197FC7;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .clear-filters:hover {
          background: rgba(25, 127, 199, 0.1);
        }

        .filter-group {
          margin-bottom: 1.25rem;
        }

        .filter-group:last-child {
          margin-bottom: 0;
        }

        .filter-group h4 {
          font-size: 0.8rem;
          font-weight: 500;
          color: #666;
          margin: 0 0 0.75rem 0;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #ddd;
          border-radius: 50px;
          font-size: 0.875rem;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-chip:hover {
          border-color: #197FC7;
          color: #197FC7;
        }

        .filter-chip.active {
          background: #197FC7;
          border-color: #197FC7;
          color: white;
        }

        .filter-chip .check-icon {
          width: 14px;
          height: 14px;
        }

        .products-results-info {
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #666;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .no-results p {
          margin-bottom: 1rem;
        }

        .clear-filters-link {
          background: none;
          border: none;
          color: #197FC7;
          font-size: 1rem;
          cursor: pointer;
          text-decoration: underline;
        }

        @media (max-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .products-filters {
            padding: 1rem;
          }

          .filter-options {
            gap: 0.375rem;
          }

          .filter-chip {
            padding: 0.375rem 0.75rem;
            font-size: 0.8rem;
          }

          .products-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
