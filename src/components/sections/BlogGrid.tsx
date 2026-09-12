'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { localeFullCodes, type Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import Icon from '@/components/ui/Icon';

import { LEGACY_POSTS, type BlogGridPost } from '@/data/legacy-posts';

interface BlogGridProps {
  posts?: BlogGridPost[];
}

export default function BlogGrid({ posts = LEGACY_POSTS }: BlogGridProps) {
  const t = useTranslations('blogPosts');
  const locale = useLocale();
  const dateLocale = localeFullCodes[locale as Locale] ?? 'en-BE';
  const tCommon = useTranslations('blog');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="blog-grid">
      {posts.map((post) => (
        <article key={post.slug} className="blog-card">
          <Link href={`/blog/${post.slug}`} className="blog-card-link">
            <div className="blog-image">
              <span className="blog-category">{tCommon(`categories.${post.category}`)}</span>
              {post.image ? (
                <Image src={post.image} alt={post.imageAlt ?? ''} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="image-placeholder"><Icon name="document" /></div>
              )}
            </div>
            <div className="blog-content">
              <time className="blog-date">{formatDate(post.date)}</time>
              <h3>{post.title ?? t(`${post.slug}.title`)}</h3>
              <p>{post.excerpt ?? t(`${post.slug}.excerpt`)}</p>
              <span className="read-more">
                {tCommon('readMore')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </article>
      ))}

      <style jsx>{`
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .blog-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .blog-card-link {
          text-decoration: none;
          display: block;
        }

        .blog-image {
          aspect-ratio: 16 / 10;
          background: var(--brand-blue-pale);
          position: relative;
          overflow: hidden;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brand-blue);
        }

        .image-placeholder :global(svg) {
          width: 48px;
          height: 48px;
        }

        .blog-category {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: white;
          color: var(--brand-blue);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .blog-content {
          padding: 1.5rem;
        }

        .blog-date {
          font-size: 0.85rem;
          color: #767676;
        }

        .blog-content h3 {
          font-size: 1.2rem;
          color: var(--deep-blue);
          margin: 0.5rem 0 0.75rem;
          line-height: 1.4;
        }

        .blog-content p {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .read-more {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--brand-blue);
          font-weight: 600;
          font-size: 0.9rem;
          margin-top: 1rem;
        }

        .read-more :global(svg) {
          width: 18px;
          height: 18px;
          transition: transform 0.3s ease;
        }

        .blog-card:hover .read-more :global(svg) {
          transform: translateX(4px);
        }

        @media (max-width: 992px) {
          .blog-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .blog-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
