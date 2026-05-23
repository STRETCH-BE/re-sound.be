'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

interface FAQContentProps {
  questionKeys: string[];
}

const CATEGORY_KEYS = ['all', 'acoustics', 'products', 'sustainability', 'commercial'] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

export default function FAQContent({ questionKeys }: FAQContentProps) {
  const t = useTranslations('faq');
  const locale = useLocale();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Resolve each question into a fully-translated row so we can filter on it
  const rows = useMemo(
    () =>
      questionKeys.map((key) => ({
        key,
        question: t(`questions.${key}.question`),
        answer: t(`questions.${key}.answer`),
        category: t(`questions.${key}.category`) as CategoryKey,
      })),
    [questionKeys, t]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (activeCategory !== 'all' && r.category !== activeCategory) return false;
      if (!q) return true;
      return (
        r.question.toLowerCase().includes(q) || r.answer.toLowerCase().includes(q)
      );
    });
  }, [rows, search, activeCategory]);

  return (
    <section className="faq-page">
      <div className="faq-hero">
        <h1>{t('title')}</h1>
        <p className="faq-subtitle">{t('subtitle')}</p>
      </div>

      <div className="faq-controls">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          className="faq-search"
        />

        <div className="faq-filters" role="tablist" aria-label="Categories">
          {CATEGORY_KEYS.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              className={`faq-filter ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>
      </div>

      <ol className="faq-list">
        {filtered.length === 0 ? (
          <li className="faq-empty">{t('noResults')}</li>
        ) : (
          filtered.map((row, idx) => {
            const isOpen = openKey === row.key;
            return (
              <li key={row.key} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${row.key}`}
                  onClick={() => setOpenKey(isOpen ? null : row.key)}
                >
                  <span className="faq-number">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="faq-q-text">{row.question}</span>
                  <span className="faq-toggle" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  id={`faq-answer-${row.key}`}
                  className="faq-answer"
                  role="region"
                  hidden={!isOpen}
                >
                  <p>{row.answer}</p>
                </div>
              </li>
            );
          })
        )}
      </ol>

      <div className="faq-contact">
        <h2>{t('contact.title')}</h2>
        <p>{t('contact.body')}</p>
        <Link href={`/${locale}/contact`} className="faq-contact-cta">
          {t('contact.cta')}
        </Link>
      </div>

      <style jsx>{`
        .faq-page {
          max-width: 920px;
          margin: 0 auto;
          padding: 6rem 1.5rem 6rem;
          font-family: var(--font-body);
        }

        .faq-hero {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .faq-hero h1 {
          font-family: var(--font-heading);
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 1rem;
          color: var(--charcoal, #111);
        }

        .faq-subtitle {
          font-size: 1.05rem;
          line-height: 1.6;
          color: #555;
          max-width: 56ch;
          margin: 0 auto;
        }

        .faq-controls {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .faq-search {
          width: 100%;
          padding: 0.85rem 1.1rem;
          font-size: 1rem;
          font-family: inherit;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fafafa;
          transition: border-color 0.18s ease, background 0.18s ease;
        }

        .faq-search:focus {
          outline: none;
          border-color: #197fc7;
          background: #fff;
        }

        .faq-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .faq-filter {
          padding: 0.45rem 1rem;
          font-size: 0.9rem;
          font-family: inherit;
          background: #f1f1f1;
          color: #555;
          border: 1px solid transparent;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
        }

        .faq-filter:hover {
          background: #e6e6e6;
        }

        .faq-filter.active {
          background: #197fc7;
          color: white;
        }

        .faq-list {
          list-style: none;
          padding: 0;
          margin: 0;
          border-top: 1px solid #eee;
        }

        .faq-empty {
          padding: 2.5rem 1rem;
          text-align: center;
          color: #888;
        }

        .faq-item {
          border-bottom: 1px solid #eee;
        }

        .faq-question {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: start;
          gap: 1.1rem;
          width: 100%;
          padding: 1.5rem 0.5rem;
          background: transparent;
          border: none;
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s;
        }

        .faq-question:hover {
          background: #fafafa;
        }

        .faq-number {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 600;
          color: #197fc7;
          letter-spacing: 0.04em;
          padding-top: 0.15rem;
        }

        .faq-q-text {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--charcoal, #111);
          line-height: 1.4;
        }

        .faq-toggle {
          font-size: 1.4rem;
          font-weight: 300;
          color: #197fc7;
          line-height: 1;
          width: 1.2rem;
          text-align: center;
        }

        .faq-answer {
          padding: 0 0.5rem 1.5rem 3.2rem;
          color: #444;
          font-size: 1rem;
          line-height: 1.65;
        }

        .faq-answer p {
          margin: 0;
        }

        .faq-contact {
          margin-top: 4.5rem;
          padding: 2.5rem;
          background: #f6faff;
          border-radius: 12px;
          text-align: center;
        }

        .faq-contact h2 {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0 0 0.75rem;
          color: var(--charcoal, #111);
        }

        .faq-contact p {
          color: #555;
          margin: 0 0 1.5rem;
          font-size: 1rem;
          line-height: 1.6;
        }

        :global(.faq-contact-cta) {
          display: inline-block;
          padding: 0.85rem 1.75rem;
          background: #197fc7;
          color: white !important;
          text-decoration: none;
          font-weight: 500;
          border-radius: 6px;
          transition: background 0.18s;
        }

        :global(.faq-contact-cta:hover) {
          background: #146cab;
        }

        @media (max-width: 640px) {
          .faq-page {
            padding: 4rem 1rem 4rem;
          }
          .faq-question {
            padding: 1.25rem 0.25rem;
            gap: 0.8rem;
          }
          .faq-answer {
            padding-left: 2.2rem;
          }
        }
      `}</style>
    </section>
  );
}
