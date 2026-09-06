import { getTranslations } from 'next-intl/server';

import { getTestimonials } from '@/lib/content/testimonials';

interface TestimonialsProps {
  locale: string;
}

const Stars = ({ rating }: { rating: number }) => (
  <span className="tm-stars" aria-label={`${rating}/5`}>
    {'★★★★★'.slice(0, Math.round(rating))}
    <span className="tm-stars-off">{'★★★★★'.slice(Math.round(rating))}</span>
  </span>
);

/**
 * "What customers say": Google rating badge linking to the listing plus the
 * review cards (star-only reviews as rating rows). Texts stay in their
 * original language with a "via Google" label. No Review / AggregateRating
 * JSON-LD — third-party reviews may not be marked up as the site's own.
 */
export default async function Testimonials({ locale }: TestimonialsProps) {
  const t = await getTranslations({ locale, namespace: 'testimonials' });
  const data = await getTestimonials();
  const rating = data.google.rating ?? 5;
  const count = data.google.reviewCount ?? data.reviews.length;
  const ratingLabel = rating.toLocaleString(locale === 'en' ? 'en-GB' : locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const withText = data.reviews.filter((r) => r.text);
  const ratingOnly = data.reviews.filter((r) => !r.text);

  return (
    <section className="tm-section" aria-labelledby="testimonials-title">
      <div className="tm-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2 id="testimonials-title">{t('title')}</h2>
        {data.google.mapsUrl ? (
          <a className="tm-badge" href={data.google.mapsUrl} target="_blank" rel="noopener noreferrer">
            <strong>{ratingLabel}</strong> <Stars rating={rating} /> · {t('googleReviews', { count })}
          </a>
        ) : (
          <p className="tm-badge">
            <strong>{ratingLabel}</strong> <Stars rating={rating} /> · {t('googleReviews', { count })}
          </p>
        )}

        {withText.length > 0 && (
          <ul className="tm-grid">
            {withText.map((r) => (
              <li key={r.author + r.date} className="tm-card" lang={r.locale}>
                <Stars rating={r.rating} />
                <blockquote>{r.text}</blockquote>
                <footer>
                  <span className="tm-author">{r.author}</span>
                  <span className="tm-meta">{r.date} · {t('viaGoogle')}</span>
                </footer>
              </li>
            ))}
          </ul>
        )}

        {ratingOnly.length > 0 && (
          <ul className="tm-rows">
            {ratingOnly.map((r) => (
              <li key={r.author + r.date}>
                <Stars rating={r.rating} /> <span className="tm-author">{r.author}</span> <span className="tm-meta">· {r.date} · {t('viaGoogle')}</span>
              </li>
            ))}
          </ul>
        )}

        {(data.google.writeReviewUrl ?? data.google.mapsUrl) && (
          <p className="tm-cta">
            <a href={data.google.writeReviewUrl ?? data.google.mapsUrl ?? '#'} target="_blank" rel="noopener noreferrer">{t('reviewUs')} →</a>
          </p>
        )}
      </div>
    </section>
  );
}
