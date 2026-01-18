import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ProductDetail from '@/components/sections/ProductDetail';
import ProductSpecs from '@/components/sections/ProductSpecs';
import RelatedProducts from '@/components/sections/RelatedProducts';
import CTA from '@/components/sections/CTA';
import InteriorProductPage from '@/components/sections/InteriorProductPage';

// Define available products
const products = ['interior', 'solid', 'divide'] as const;
type ProductSlug = (typeof products)[number];

interface ProductPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

// Generate static paths for all products
export function generateStaticParams() {
  return products.map((slug) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params: { locale, slug },
}: ProductPageProps): Promise<Metadata> {
  // Validate product exists
  if (!products.includes(slug as ProductSlug)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'products' });

  return {
    title: t(`${slug}.title`),
    description: t(`${slug}.fullDescription`),
    openGraph: {
      title: `${t(`${slug}.title`)} | Re-Sound`,
      description: t(`${slug}.fullDescription`),
      images: [`/images/products/${slug}.jpg`],
    },
    alternates: {
      canonical: `/${locale}/products/${slug}`,
      languages: {
        en: `/en/products/${slug}`,
        nl: `/nl/products/${slug}`,
        fr: `/fr/products/${slug}`,
        de: `/de/products/${slug}`,
      },
    },
  };
}

export default async function ProductPage({ params: { locale, slug } }: ProductPageProps) {
  // Enable static rendering - must be called before any other next-intl functions
  setRequestLocale(locale);
  
  // Validate product exists
  if (!products.includes(slug as ProductSlug)) {
    notFound();
  }

  // Use dedicated page for Interior product
  if (slug === 'interior') {
    return <InteriorProductPage />;
  }

  const t = await getTranslations('products');

  // Product data - in a real app, this might come from a CMS
  const productData = {
    solid: {
      gradient: 'dark' as const,
      features: ['minimalist', 'easyInstall', 'durable'],
    },
    divide: {
      gradient: 'accent' as const,
      features: ['partition', 'portable', 'modular'],
    },
  };

  const product = productData[slug as 'solid' | 'divide'];

  return (
    <>
      {/* Product Detail Hero */}
      <ProductDetail
        slug={slug}
        title={t(`${slug}.title`)}
        description={t(`${slug}.fullDescription`)}
        gradient={product.gradient}
      />

      {/* Product Specifications */}
      <ProductSpecs slug={slug} />

      {/* Related Products */}
      <RelatedProducts currentSlug={slug} />

      {/* CTA */}
      <CTA
        title={t('ctaTitle')}
        subtitle={t('ctaSubtitle')}
        primaryText={t('ctaPrimary')}
        primaryHref="/contact"
      />
    </>
  );
}
