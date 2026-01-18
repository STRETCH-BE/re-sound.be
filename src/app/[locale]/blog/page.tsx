import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

import PageHero from '@/components/sections/PageHero';
import BlogGrid from '@/components/sections/BlogGrid';
import Newsletter from '@/components/sections/Newsletter';

interface BlogPageProps {
  params: { locale: string };
}

// Generate metadata for SEO
export async function generateMetadata({
  params: { locale },
}: BlogPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('blogTitle'),
    description: t('blogDescription'),
    openGraph: {
      title: `${t('blogTitle')} | Re-Sound`,
      description: t('blogDescription'),
    },
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        en: '/en/blog',
        nl: '/nl/blog',
        fr: '/fr/blog',
        de: '/de/blog',
      },
    },
  };
}

export default async function BlogPage({ params: { locale } }: BlogPageProps) {
  // Enable static rendering - must be called before any other next-intl functions
  setRequestLocale(locale);
  
  const t = await getTranslations('blog');

  return (
    <>
      {/* Page Hero */}
      <PageHero
        tag={t('tag')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {/* Blog Grid */}
      <section className="blog-content">
        <div className="blog-inner">
          <BlogGrid />
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </>
  );
}
