'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface RelatedPostsProps {
  currentSlug: string;
  category?: string;
}

// Sample related posts - in a real app, this would be dynamic
const allPosts = [
  { slug: 'circular-economy-acoustics', category: 'sustainability' },
  { slug: 'office-acoustic-solutions', category: 'products' },
  { slug: 'recycled-materials-quality', category: 'materials' },
  { slug: 'sound-absorption-explained', category: 'education' },
];

export default function RelatedPosts({ currentSlug, category }: RelatedPostsProps) {
  const t = useTranslations('blogPosts');
  const tCommon = useTranslations('blog');

  const relatedPosts = allPosts
    .filter((post) => post.slug !== currentSlug)
    .slice(0, 3);

  return (
    <section className="related-posts">
      <div className="related-inner">
        <span className="section-tag">{tCommon('relatedTag')}</span>
        <h2>{tCommon('relatedTitle')}</h2>

        <div className="related-grid">
          {relatedPosts.map((post) => (
            <article key={post.slug} className="related-card">
              <Link href={`/blog/${post.slug}`} className="related-link">
                <div className="related-image">
                  <span className="related-category">
                    {tCommon(`categories.${post.category}`)}
                  </span>
                  <div className="image-placeholder">📄</div>
                </div>
                <h3>{t(`${post.slug}.title`)}</h3>
              </Link>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .related-posts {
          padding: 6rem 4rem;
          background: var(--cream);
        }

        .related-inner {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .related-inner h2 {
          font-size: 2rem;
          color: var(--deep-blue);
          margin: 0.5rem 0 3rem;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .related-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .related-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }

        .related-link {
          text-decoration: none;
        }

        .related-image {
          aspect-ratio: 16 / 10;
          background: var(--brand-blue-pale);
          position: relative;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .related-category {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background: white;
          color: var(--brand-blue);
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.3rem 0.6rem;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .related-card h3 {
          padding: 1rem 1.25rem 1.25rem;
          font-size: 1rem;
          color: var(--deep-blue);
          line-height: 1.4;
          text-align: left;
        }

        @media (max-width: 992px) {
          .related-posts {
            padding: 4rem 1.5rem;
          }

          .related-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
        }

        @media (max-width: 576px) {
          .related-posts {
            padding: 3rem 1rem;
          }
        }
      `}</style>
    </section>
  );
}
