'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface BlogPost {
  slug: string;
  category: string;
  date: string;
}

// Default posts list
const defaultPosts: BlogPost[] = [
  { slug: 'circular-economy-acoustics', category: 'sustainability', date: '2024-01-15' },
  { slug: 'office-acoustic-solutions', category: 'products', date: '2024-01-10' },
  { slug: 'recycled-materials-quality', category: 'materials', date: '2024-01-05' },
  { slug: 'sound-absorption-explained', category: 'education', date: '2024-01-01' },
];

interface BlogGridProps {
  posts?: BlogPost[];
}

export default function BlogGrid({ posts = defaultPosts }: BlogGridProps) {
  const t = useTranslations('blogPosts');
  const tCommon = useTranslations('blog');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
              <div className="image-placeholder">📄</div>
            </div>
            <div className="blog-content">
              <time className="blog-date">{formatDate(post.date)}</time>
              <h3>{t(`${post.slug}.title`)}</h3>
              <p>{t(`${post.slug}.excerpt`)}</p>
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
          font-size: 3rem;
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
          color: #888;
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
