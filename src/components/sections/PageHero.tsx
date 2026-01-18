"use client";

interface PageHeroProps {
  tag?: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
}

export default function PageHero({ tag, title, subtitle, dark = false }: PageHeroProps) {
  return (
    <section className={`page-hero ${dark ? 'dark' : ''}`}>
      {tag && <span className="section-tag">{tag}</span>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}

      <style jsx>{`
        .page-hero {
          padding: 10rem 4rem 4rem;
          background: var(--cream);
          text-align: center;
        }

        .page-hero.dark {
          background: var(--brand-blue);
          color: white;
        }

        .page-hero.dark .section-tag {
          color: var(--brand-blue-pale);
        }

        .page-hero h1 {
          font-size: 3rem;
          color: var(--deep-blue);
          margin: 0.5rem 0 1rem;
          letter-spacing: -1px;
        }

        .page-hero.dark h1 {
          color: white;
        }

        .page-hero p {
          color: #666;
          font-size: 1.15rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .page-hero.dark p {
          color: rgba(255, 255, 255, 0.85);
        }

        @media (max-width: 992px) {
          .page-hero {
            padding: 8rem 1.5rem 3rem;
          }

          .page-hero h1 {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 576px) {
          .page-hero {
            padding: 7rem 1rem 2.5rem;
          }

          .page-hero h1 {
            font-size: 2rem;
          }

          .page-hero p {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
