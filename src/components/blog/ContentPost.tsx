import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import MarkdownBody from '@/components/blog/MarkdownBody';
import JsonLd from '@/components/seo/JsonLd';
import { localeFullCodes, type Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { ContentPost as Post } from '@/lib/content/blog';
import { blogPostingSchema, breadcrumbSchema, faqPageSchema } from '@/lib/structured-data';

interface ContentPostProps {
  post: Post;
  related: Post[];
}

/**
 * Editorial blog post (content/blog/<locale>/<slug>.md). Server component:
 * hero, markdown body (the FAQ section stays visible in the body), CTA,
 * author box, related posts of the same locale, plus BlogPosting + FAQPage +
 * BreadcrumbList JSON-LD. Drafts show a banner and are noindex (metadata).
 */
export default async function ContentPost({ post, related }: ContentPostProps) {
  const { locale } = post;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const tHub = await getTranslations({ locale, namespace: 'hubs.shared' });
  const dateLocale = localeFullCodes[locale as Locale] ?? 'en-BE';
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });
  const minutes = Math.max(1, Math.round(post.wordCount / 200));
  const path = `/${locale}/blog/${post.slug}`;

  return (
    <article className="post">
      <JsonLd
        data={blogPostingSchema({
          locale,
          slug: post.slug,
          headline: post.h1,
          description: post.description,
          datePublished: post.datePublished,
          dateModified: post.dateModified,
          image: post.heroImage,
          author: post.author,
          wordCount: post.wordCount,
        })}
      />
      {post.faq.length > 0 && <JsonLd data={faqPageSchema(post.faq)} />}
      <JsonLd
        data={breadcrumbSchema([
          { name: tHub('breadcrumbHome'), url: `/${locale}` },
          { name: t('title'), url: `/${locale}/blog` },
          { name: post.h1, url: path },
        ])}
      />

      {post.draft && <p className="post-draft-banner">{t('draftBanner')}</p>}

      <header className="post-hero">
        <div className="post-hero-inner">
          <span className="section-tag">{t(`categories.${post.category}`)}</span>
          <h1>{post.h1}</h1>
          <p className="post-lead">{post.description}</p>
          <div className="post-meta">
            <span>{t('by')} {post.author.name}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.datePublished}>{fmt(post.datePublished)}</time>
            <span aria-hidden="true">·</span>
            <span>{t('minRead', { minutes })}</span>
          </div>
        </div>
      </header>

      <figure className="post-figure">
        <Image src={post.heroImage} alt={post.heroAlt} width={1600} height={900} priority sizes="(max-width: 1100px) 100vw, 1040px" />
      </figure>

      <div className="post-body">
        <MarkdownBody markdown={post.body} />
      </div>

      <aside className="post-cta">
        <p>{post.cta}</p>
        <Link href="/contact" className="btn-primary" prefetch={false}>{t('ctaQuote')}</Link>
      </aside>

      <div className="post-author">
        <div>
          <span className="post-author-name">{post.author.name}</span>
          {post.author.jobTitle && <span className="post-author-role">{post.author.jobTitle}</span>}
        </div>
      </div>

      {related.length > 0 && (
        <section className="post-related">
          <h2>{t('relatedTitle')}</h2>
          <ul className="post-related-grid">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/blog/${r.slug}`} prefetch={false}>
                  <time dateTime={r.datePublished}>{fmt(r.datePublished)}</time>
                  <h3>{r.h1}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
