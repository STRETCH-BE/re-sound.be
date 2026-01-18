"use client";

import { useTranslations } from 'next-intl';

interface BlogPostAuthorProps {
  authorName?: string;
  authorRole?: string;
}

export default function BlogPostAuthor({ authorName, authorRole }: BlogPostAuthorProps) {
  const t = useTranslations('blog');
  
  const name = authorName || t('defaultAuthor.name');
  const role = authorRole || t('defaultAuthor.role');
  
  return (
    <div className="blog-post-author">
      <div className="author-avatar">
        <span>👤</span>
      </div>
      <div className="author-info">
        <span className="author-name">{name}</span>
        <span className="author-role">{role}</span>
      </div>

      <style jsx>{`
        .blog-post-author {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--cream);
          border-radius: 16px;
          margin-top: 3rem;
        }

        .author-avatar {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        .author-info {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          font-weight: 600;
          color: var(--deep-blue);
          font-size: 1.1rem;
        }

        .author-role {
          color: var(--brand-blue);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
