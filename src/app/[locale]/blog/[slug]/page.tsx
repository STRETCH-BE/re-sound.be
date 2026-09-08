import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import { pickMessages } from '@/lib/i18n-messages';
import { blogPostingSchema, breadcrumbSchema } from '@/lib/structured-data';
import { getContentPost, getContentPosts, resolveContentPost } from '@/lib/content/blog';
import JsonLd from '@/components/seo/JsonLd';

import ContentPost from '@/components/blog/ContentPost';
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

// The legacy (message-driven) posts, published in every locale.
const BLOG_SLUGS = [
  'circular-economy-acoustics',
  'office-acoustic-solutions',
  'recycled-materials-quality',
  'sound-absorption-explained',
];

/**
 * Static params per locale: the four legacy posts everywhere, plus the
 * editorial posts of that locale (content/blog/<locale>/*.md, drafts
 * included so they can be previewed). Any other slug is a hard 404.
 */
export function generateStaticParams({ params }: { params: { locale: string } }) {
  const editorial = getContentPosts(params.locale, { includeDrafts: true }).map((p) => ({ slug: p.slug }));
  return [...BLOG_SLUGS.map((slug) => ({ slug })), ...editorial];
}

export const dynamicParams = false;

export async function generateMetadata({
  params: { locale, slug },
}: BlogPostPageProps): Promise<Metadata> {
  const draftPost = getContentPost(locale, slug);
  if (draftPost) {
    // Prices in the description come from the catalogue, not the markdown.
    const post = await resolveContentPost(draftPost);
    // Single-locale editorial post: canonical to itself, no hreflang
    // alternates (it is not translated). Drafts are noindex.
    return {
      title: { absolute: post.title },
      description: post.description,
      robots: post.draft ? { index: false, follow: false } : { index: true, follow: true },
      openGraph: {
        title: post.h1,
        description: post.description,
        type: 'article',
        publishedTime: post.datePublished,
        modifiedTime: post.dateModified,
        authors: [post.author.name],
        locale: ogLocale(locale),
        images: [{ url: post.heroImage, width: 1600, height: 900, alt: post.heroAlt }],
      },
      alternates: { canonical: `/${locale}/blog/${post.slug}` },
    };
  }

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
  setRequestLocale(locale);

  const rawPost = getContentPost(locale, slug);
  if (rawPost) {
    // Price tokens in the body, lead and FAQ are filled from the catalogue.
    const post = await resolveContentPost(rawPost);
    const related = await Promise.all(
      getContentPosts(locale).filter((p) => p.slug !== post.slug).slice(0, 3).map(resolveContentPost)
    );
    const messages = pickMessages(await getMessages(), ['newsletter']);
    return (
      <>
        <ContentPost post={post} related={related} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Newsletter />
        </NextIntlClientProvider>
      </>
    );
  }

  if (!BLOG_SLUGS.includes(slug)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'blogPosts' });
  const tBlog = await getTranslations({ locale, namespace: 'blog' });
  const tHome = await getTranslations({ locale, namespace: 'hubs.shared' });
  const title = t(`${slug}.title`);
  const excerpt = t(`${slug}.excerpt`);

  const messages = pickMessages(await getMessages(), [
    'blog',
    'blogPosts',
    'newsletter',
  ]);

  return (
    <>
      {/* datePublished comes from the post's own date field; the author is the
          organisation until BLOG_AUTHOR in src/config/site.ts is confirmed. */}
      <JsonLd
        data={blogPostingSchema({
          locale,
          slug,
          headline: title,
          description: excerpt,
          datePublished: t(`${slug}.date`),
          image: `/api/og?page=blog&locale=${locale}`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: tHome('breadcrumbHome'), url: `/${locale}` },
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
