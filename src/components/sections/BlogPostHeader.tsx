"use client";

import { useTranslations } from 'next-intl';

interface BlogPostHeaderProps {
  slug: string;
}

export default function BlogPostHeader({ slug }: BlogPostHeaderProps) {
  const t = useTranslations('blogPosts');
  
  const title = t(`${slug}.title`);
  const excerpt = t(`${slug}.excerpt`);
  const category = t(`${slug}.category`);
  const date = t(`${slug}.date`);
  const readTime = parseInt(t(`${slug}.readTime`), 10);
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <header className="blog-post-header">
      <div className="header-content">
        <span className="post-category">{category}</span>
        <h1>{title}</h1>
        <p className="post-excerpt">{excerpt}</p>
        <div className="post-meta">
          <time>{formatDate(date)}</time>
          <span className="meta-divider">•</span>
          <span>{readTime} min read</span>
        </div>
      </div>

      <div className="header-image">
        <div className="image-placeholder">📄</div>
      </div>

      <style jsx>{`
        .blog-post-header {
          padding: 8rem 4rem 4rem;
          background: var(--cream);
        }

        .header-content {
          max-width: 800px;
          margin: 0 auto 3rem;
          text-align: center;
        }

        .post-category {
          display: inline-block;
          background: var(--brand-blue-pale);
          color: var(--brand-blue);
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1.5rem;
        }

        h1 {
          font-size: 3rem;
          color: var(--deep-blue);
          line-height: 1.2;
          margin-bottom: 1.5rem;
          letter-spacing: -1px;
        }

        .post-excerpt {
          font-size: 1.2rem;
          color: #666;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .post-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #888;
          font-size: 0.95rem;
        }

        .meta-divider {
          color: var(--sand);
        }

        .header-image {
          max-width: 1000px;
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          background: var(--brand-blue-pale);
          border-radius: 24px;
          overflow: hidden;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
        }

        @media (max-width: 992px) {
          .blog-post-header {
            padding: 6rem 1.5rem 3rem;
          }

          h1 {
            font-size: 2.2rem;
          }
        }

        @media (max-width: 576px) {
          .blog-post-header {
            padding: 5rem 1rem 2rem;
          }

          h1 {
            font-size: 1.8rem;
          }

          .post-excerpt {
            font-size: 1rem;
          }
        }
      `}</style>
    </header>
  );
}
