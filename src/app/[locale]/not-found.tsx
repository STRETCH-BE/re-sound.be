import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface NotFoundProps {
  params?: { locale: string };
}

// Translated metadata + robots noindex. Without this, Next.js would let
// search engines index 404 URLs, polluting the index with thin pages.
export async function generateMetadata({ params }: NotFoundProps): Promise<Metadata> {
  // `not-found.tsx` can be invoked outside a locale segment; fall back gracefully.
  const locale = params?.locale ?? 'en';
  let title = 'Page not found';
  try {
    const t = await getTranslations({ locale, namespace: 'notFound' });
    title = t('title');
  } catch {
    /* Use fallback title */
  }
  return {
    title,
    robots: { index: false, follow: true },
  };
}

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>{t('title')}</h2>
        <p>{t('description')}</p>

        <div className="not-found-buttons">
          <Link href="/" className="btn-primary">
            {t('backHome')}
          </Link>
          <Link href="/contact" className="btn-secondary">
            {t('contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
}
