'use client';

import { useTranslations } from 'next-intl';

interface BlogPostContentProps {
  slug: string;
}

export default function BlogPostContent({ slug }: BlogPostContentProps) {
  const t = useTranslations(`blogPosts.${slug}.content`);

  // In a real app, this would come from a CMS or MDX files
  // For now, we use translation keys for the content sections
  return (
    <div className="blog-post-content">
      <p className="lead">{t('intro')}</p>

      <h2>{t('section1.title')}</h2>
      <p>{t('section1.text')}</p>

      <h2>{t('section2.title')}</h2>
      <p>{t('section2.text')}</p>

      <blockquote>
        <p>{t('quote')}</p>
      </blockquote>

      <h2>{t('section3.title')}</h2>
      <p>{t('section3.text')}</p>

      <h3>{t('conclusion.title')}</h3>
      <p>{t('conclusion.text')}</p>

      <style jsx>{`
        .blog-post-content {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--charcoal);
        }

        .blog-post-content .lead {
          font-size: 1.25rem;
          color: #555;
          margin-bottom: 2rem;
        }

        .blog-post-content h2 {
          font-size: 1.8rem;
          color: var(--deep-blue);
          margin: 2.5rem 0 1rem;
        }

        .blog-post-content h3 {
          font-size: 1.4rem;
          color: var(--deep-blue);
          margin: 2rem 0 0.75rem;
        }

        .blog-post-content p {
          margin-bottom: 1.5rem;
        }

        .blog-post-content blockquote {
          margin: 2rem 0;
          padding: 1.5rem 2rem;
          background: var(--brand-blue-pale);
          border-left: 4px solid var(--brand-blue);
          border-radius: 0 12px 12px 0;
        }

        .blog-post-content blockquote p {
          margin: 0;
          font-style: italic;
          color: var(--deep-blue);
        }

        .blog-post-content ul,
        .blog-post-content ol {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }

        .blog-post-content li {
          margin-bottom: 0.75rem;
        }

        .blog-post-content a {
          color: var(--brand-blue);
          text-decoration: underline;
        }

        .blog-post-content a:hover {
          color: var(--brand-blue-dark);
        }
      `}</style>
    </div>
  );
}
