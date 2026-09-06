import { getTranslations } from 'next-intl/server';

import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTION_OFFICE } from '@/config/site';
import { productionOfficeSchema } from '@/lib/structured-data';

/**
 * "Re-Sound Poland — production office" block (workbook Dealers_Showrooms)
 * with its LocalBusiness node. Server component, plain CSS (content.css).
 */
export default async function ProductionOffice({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'whereToBuyPage.office' });
  return (
    <section className="office-section" aria-labelledby="production-office">
      <JsonLd data={productionOfficeSchema()} />
      <div className="office-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2 id="production-office">{t('title')}</h2>
        <p className="office-description">{t('description')}</p>
        <dl className="office-meta">
          <div>
            <dt>{t('addressLabel')}</dt>
            <dd>
              {PRODUCTION_OFFICE.streetAddress}
              <br />
              {PRODUCTION_OFFICE.postalCode} {PRODUCTION_OFFICE.addressLocality}, {t('country')}
            </dd>
          </div>
          <div>
            <dt>{t('hoursLabel')}</dt>
            <dd>{t('hoursValue')}</dd>
          </div>
          <div>
            <dt>{t('languagesLabel')}</dt>
            <dd>{t('languagesValue')}</dd>
          </div>
          <div>
            <dt>{t('contactLabel')}</dt>
            <dd>
              <a href={`mailto:${PRODUCTION_OFFICE.email}`}>{PRODUCTION_OFFICE.email}</a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
