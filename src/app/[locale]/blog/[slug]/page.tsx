import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import { pickMessages } from '@/lib/i18n-messages';
import { breadcrumbSchema, SITE_URL } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';

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

// The complete set of published posts. Any other slug is a hard 404 —
// without this check the route returned HTTP 200 with raw i18n keys for
// every conceivable URL, an infinite soft-404 space for crawlers.
const BLOG_SLUGS = [
  'circular-economy-acoustics',
  'office-acoustic-solutions',
  'recycled-materials-quality',
  'sound-absorption-explained',
];

// Static params for blog posts
export function generateStaticParams() {
  return BLOG_SLUGS.map((slug) => ({ slug }));
}

// Unknown slugs 404 instead of rendering an empty shell.
export const dynamicParams = false;

// Generate metadata for SEO
export async function generateMetadata({
  params: { locale, slug },
}: BlogPostPageProps): Promise<Metadata> {
  if (!BLOG_SLUGS.includes(slug)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'blogPosts' });

  const title = t(`${slug}.title`);
  const excerpt = t(`${slug}.excerpt`);

  return {
    // The layout template appends " | Re-Sound" — passing a plain string
    // here previously produced "… | Re-Sound Blog | Re-Sound".
    title,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      type: 'article',
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      images: [
        {
          url: `/api/og?page=blog&locale=${locale}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    alternates: buildAlternates(locale, `/blog/${slug}`),
  };
}

export default async function BlogPostPage({ params: { locale, slug } }: BlogPostPageProps) {
  if (!BLOG_SLUGS.includes(slug)) {
    notFound();
  }

  // Enable static rendering - must be called before any other next-intl functions
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'blogPosts' });
  const tBlog = await getTranslations({ locale, namespace: 'blog' });
  const title = t(`${slug}.title`);
  const excerpt = t(`${slug}.excerpt`);

  const messages = pickMessages(await getMessages(), [
    'blog',
    'blogPosts',
    'newsletter',
  ]);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          '@id': `${SITE_URL}/${locale}/blog/${slug}#article`,
          headline: title,
          description: excerpt,
          inLanguage: locale,
          mainEntityOfPage: `${SITE_URL}/${locale}/blog/${slug}`,
          author: { '@type': 'Organization', name: 'Re-Sound', url: SITE_URL },
          publisher: {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: 'Re-Sound',
            url: SITE_URL,
            logo: {
              '@type': 'ImageObject',
              url: `${SITE_URL}/images/re-sound-logo.png`,
            },
          },
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: `/${locale}` },
          { name: tBlog('title'), url: `/${locale}/blog` },
          { name: title, url: `/${locale}/blog/${slug}` },
        ])}
      />

      <NextIntlClientProvider locale={locale} messages={messages}>
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
      </NextIntlClientProvider>
    </>
  );
}
