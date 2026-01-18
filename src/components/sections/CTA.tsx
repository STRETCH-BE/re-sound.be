'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface CTAProps {
  title?: string;
  subtitle?: string;
  primaryText?: string;
  primaryHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
  variant?: 'default' | 'green';
}

export default function CTA({
  title,
  subtitle,
  primaryText,
  primaryHref = '/contact',
  secondaryText,
  secondaryHref = '/products',
  variant = 'default',
}: CTAProps) {
  const t = useTranslations('cta');

  return (
    <section className={`cta-section ${variant === 'green' ? 'cta-green' : ''}`}>
      <div className="cta-content">
        <h2>{title || t('title')}</h2>
        <p>{subtitle || t('subtitle')}</p>
        <div className="cta-buttons">
          <Link href={primaryHref} className="btn-primary">
            {primaryText || t('primary')}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </Link>
          {(secondaryText || t('secondary')) && (
            <Link href={secondaryHref} className="btn-secondary">
              {secondaryText || t('secondary')}
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .cta-green {
          background: var(--accent) !important;
        }

        .cta-green .btn-primary {
          background: white;
          color: var(--accent);
        }

        .cta-green .btn-primary:hover {
          background: var(--cream);
        }

        .cta-green .btn-secondary {
          border-color: white;
          color: white;
        }

        .cta-green .btn-secondary:hover {
          background: white;
          color: var(--accent);
        }
      `}</style>
    </section>
  );
}
