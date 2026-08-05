// 404 page (noindex, follow). Rendered for notFound() calls and unmatched
// routes within the locale segment.
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: { absolute: t('notFoundTitle') },
    description: t('notFoundDescription'),
    robots: { index: false, follow: true },
  };
}

export default function NotFound() {
  return (
    <section className="container section" style={{ textAlign: 'center', minHeight: '54vh' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(72px,16vw,180px)',
          lineHeight: 0.86,
          letterSpacing: '-.04em',
          color: 'var(--black)',
        }}
      >
        4<span style={{ color: 'var(--red)' }}>0</span>4
      </div>
      <h1 className="h2 h2--sm" style={{ margin: '20px 0 14px' }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 30px' }}>
        The page you are looking for may have moved or no longer exists.
      </p>
      <Link href="/" className="btn btn--primary">
        Back to home →
      </Link>
    </section>
  );
}
