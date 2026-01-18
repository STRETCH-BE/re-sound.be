import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

import BlogPostHeader from '@/components/sections/BlogPostHeader';
import BlogPostContent from '@/components/sections/BlogPostContent';
import BlogPostAuthor from '@/components/sections/BlogPostAuthor';
import RelatedPosts from '@/components/sections/RelatedPosts';
import Newsletter from '@/components/sections/Newsletter';

interface BlogPostPageProps {
  params: { 
    locale: string;
    slug: string;
  };
}

// Static params for blog posts
export function generateStaticParams() {
  return [
    { slug: 'circular-economy-acoustics' },
    { slug: 'office-acoustic-solutions' },
    { slug: 'recycled-materials-quality' },
    { slug: 'sound-absorption-explained' },
  ];
}

// Generate metadata for SEO
export async function generateMetadata({
  params: { locale, slug },
}: BlogPostPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'blogPosts' });
  
  const title = t(`${slug}.title`);
  const excerpt = t(`${slug}.excerpt`);

  return {
    title: `${title} | Re-Sound Blog`,
    description: excerpt,
    openGraph: {
      title: `${title} | Re-Sound`,
      description: excerpt,
      type: 'article',
    },
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        en: `/en/blog/${slug}`,
        nl: `/nl/blog/${slug}`,
        fr: `/fr/blog/${slug}`,
        de: `/de/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPostPage({ params: { locale, slug } }: BlogPostPageProps) {
  // Enable static rendering - must be called before any other next-intl functions
  setRequestLocale(locale);
  
  return (
    <>
      {/* Post Header */}
      <BlogPostHeader slug={slug} />

      {/* Post Content */}
      <section className="blog-post-content">
        <div className="blog-post-inner">
          <BlogPostContent slug={slug} />
          <BlogPostAuthor />
        </div>
      </section>

      {/* Related Posts */}
      <RelatedPosts currentSlug={slug} />

      {/* Newsletter */}
      <Newsletter />
    </>
  );
}
