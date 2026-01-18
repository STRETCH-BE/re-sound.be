import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

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
