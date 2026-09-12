import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Metadata } from 'next';

import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import { pickMessages } from '@/lib/i18n-messages';
import { getContentPosts, resolveContentPost } from '@/lib/content/blog';

import PageHero from '@/components/sections/PageHero';
import BlogGrid from '@/components/sections/BlogGrid';
import { LEGACY_POSTS, type BlogGridPost } from '@/data/legacy-posts';
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
      images: [
        {
          url: `/api/og?page=blog&locale=${locale}`,
          width: 1200,
          height: 630,
          alt: `${t('blogTitle')} | Re-Sound`,
        },
      ],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
    },
    alternates: buildAlternates(locale, '/blog'),
  };
}

export default async function BlogPage({ params: { locale } }: BlogPageProps) {
  // Enable static rendering - must be called before any other next-intl functions
  setRequestLocale(locale);
  
  const t = await getTranslations('blog');
  const messages = pickMessages(await getMessages(), ['blog', 'blogPosts', 'newsletter']);

  // Editorial posts of this locale (single-locale, no drafts) come first.
  // The excerpt is the description, which may carry a price token.
  const editorialPosts = await Promise.all(getContentPosts(locale).map(resolveContentPost));
  const editorial: BlogGridPost[] = editorialPosts.map((post) => ({
    slug: post.slug,
    category: post.category,
    date: post.datePublished,
    title: post.h1,
    excerpt: post.description,
    image: post.heroImage,
    imageAlt: post.heroAlt,
  }));
  // The four January-2024 posts are noindex placeholders (see
  // src/data/legacy-posts.ts). A locale with editorial posts lists only
  // those; a locale without any keeps the placeholders so the page is not
  // empty until its own posts are published.
  const posts = editorial.length > 0 ? editorial : LEGACY_POSTS;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Page Hero */}
      <PageHero
        tag={t('tag')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {/* Blog Grid */}
      <section className="blog-content">
        <div className="blog-inner">
          <BlogGrid posts={posts} />
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </NextIntlClientProvider>
  );
}
