import { getTranslations } from 'next-intl/server';

import Breadcrumbs from '@/components/product/Breadcrumbs';
import ProductFaq from '@/components/product/ProductFaq';
import type { Crumb } from '@/components/product/Breadcrumbs';
import { crumbsToSchema } from '@/components/product/productCrumbs';
import JsonLd from '@/components/seo/JsonLd';
import Testimonials from '@/components/testimonials/Testimonials';
import { guidePath } from '@/data/guides';
import { HUBS, hubPath } from '@/data/hubs';
import { PRODUCTS, isoSpeechClass } from '@/data/products';
import { localeFullCodes, type Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { BOOTH_PRICES, getBoothGuide } from '@/lib/content/boothGuide';
import { faqFor } from '@/lib/content/faq';
import { breadcrumbSchema, faqPageSchema, type FaqEntry } from '@/lib/structured-data';

interface BoothPriceGuideProps {
  locale: string;
}

const NA = '—';

/** ISO 23351-1 speech-level reduction classes (workbook facts). */
const ISO_CLASSES = [
  { key: 'aPlus', min: 33 },
  { key: 'a', min: 30 },
  { key: 'b', min: 27 },
  { key: 'c', min: 24 },
  { key: 'd', min: 21 },
] as const;

type BoothSlug = keyof typeof BOOTH_PRICES;

/**
 * Booth price guide (server component): H1 → intro → price/spec table →
 * what is included → installation → showroom → ISO classes → end of life →
 * FAQ (rows tagged "guide") → Google reviews → CTA. Prices come from
 * content/booth-guide.json (Booth_Guide sheet) and BOOTH_PRICES; specs from
 * src/data/products.ts. JSON-LD: BreadcrumbList + one FAQPage.
 */
export default async function BoothPriceGuide({ locale }: BoothPriceGuideProps) {
  const t = await getTranslations({ locale, namespace: 'boothGuide' });
  const ts = await getTranslations({ locale, namespace: 'hubs.shared' });
  const tHub = await getTranslations({ locale, namespace: 'hubs.booths' });
  const tData = await getTranslations({ locale, namespace: 'productData' });

  const guide = getBoothGuide();
  const models = guide.models
    .map((row) => ({ row, product: PRODUCTS[row.slug], prices: BOOTH_PRICES[row.slug as BoothSlug] }))
    .filter((m) => m.product && m.product.specs.kind === 'booth');
  const eur = new Intl.NumberFormat(localeFullCodes[locale as Locale] ?? 'en-BE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
  const price = (value: number | null | undefined) => (value ? eur.format(value) : t('onRequest'));

  const hub = HUBS.booths;
  const path = guidePath(locale);
  const crumbs: Crumb[] = [
    { name: ts('breadcrumbHome'), href: '/' },
    { name: tHub('breadcrumb'), href: hubPath(hub, locale) },
    { name: t('breadcrumb'), href: path },
  ];

  const faqEntries: FaqEntry[] = faqFor(locale, 'guide').map((f) => ({ question: f.question, answer: f.answer }));

  const classModels = (min: number, max: number | null) =>
    models
      .filter((m) => {
        const db = m.product.specs.kind === 'booth' ? m.product.specs.speechLevelReductionDbA : null;
        return db !== null && db >= min && (max === null || db < max);
      })
      .map((m) => `${m.product.name} (${m.row.isoDbA ?? ''} dB(A))`)
      .join(' · ');

  const rows: Array<{ label: string; cell: (m: (typeof models)[number]) => string }> = [
    { label: t('col.capacity'), cell: (m) => (m.row.slug === 'modular-xl' ? t('personsRange') : t('persons', { count: Number(m.row.capacity) || 1 })) },
    { label: t('col.footprint'), cell: (m) => (m.product.specs.kind === 'booth' ? m.product.specs.footprint : NA) },
    { label: t('col.dimensions'), cell: (m) => (m.product.specs.kind === 'booth' ? m.product.specs.externalDimensions : NA) },
    { label: t('col.priceExcl'), cell: (m) => price(m.prices?.exclInstallation) },
    { label: t('col.priceIncl'), cell: (m) => price(m.prices?.inclInstallation) },
    { label: t('col.extra'), cell: (m) => ('extraElementIncl' in m.prices ? price(m.prices.extraElementIncl) : NA) },
    {
      label: t('col.iso'),
      cell: (m) => {
        const db = m.product.specs.kind === 'booth' ? m.product.specs.speechLevelReductionDbA : null;
        const cls = isoSpeechClass(db);
        return db !== null && cls ? `${t('classLabel', { class: cls })} · ${db} dB(A)` : NA;
      },
    },
    { label: t('col.ventilation'), cell: (m) => (m.product.specs.kind === 'booth' ? m.product.specs.ventilation : NA) },
    { label: t('col.power'), cell: (m) => (m.product.specs.kind === 'booth' ? m.product.specs.power : NA) },
    { label: t('col.weight'), cell: (m) => (m.product.specs.kind === 'booth' ? m.product.specs.weight : NA) },
    { label: t('col.assembly'), cell: (m) => t(`assembly.${m.row.slug}` as 'assembly.solo-flex') },
    { label: t('col.leadTime'), cell: (m) => tData(`${m.row.slug}.leadTime`) },
    { label: t('col.warranty'), cell: () => t('warrantyValue') },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbsToSchema(locale, crumbs))} />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}

      <div className="hub-page guide-page">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <header className="hub-hero">
          <Breadcrumbs items={crumbs} />
          <h1>{t('h1')}</h1>
          <p className="hub-intro">{t('intro')}</p>
        </header>

        {/* ── Price table ──────────────────────────────────────────── */}
        <section className="ps-section hub-table-section" id="prices">
          <div className="ps-header">
            <span className="section-tag">{t('priceTag')}</span>
            <h2>{t('priceTitle')}</h2>
            <p>{t('priceNote')}</p>
          </div>
          <div className="hub-table-wrap">
            <table className="hub-table guide-table">
              <caption className="visually-hidden">{t('tableCaption')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('col.model')}</th>
                  {models.map((m) => (
                    <th scope="col" key={m.row.slug}>
                      <Link href={`/products/${m.row.slug}`} prefetch={false}>{m.product.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    {models.map((m) => (
                      <td key={m.row.slug}>{r.cell(m)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Included / installation / showroom ───────────────────── */}
        <section className="ps-section guide-text-section" id="included">
          <div className="ps-header">
            <span className="section-tag">{t('includedTag')}</span>
            <h2>{t('includedTitle')}</h2>
          </div>
          <p className="guide-text">{t('includedText')}</p>
        </section>

        <section className="ps-section guide-text-section guide-text-section--alt" id="installation">
          <div className="ps-header">
            <span className="section-tag">{t('installationTag')}</span>
            <h2>{t('installationTitle')}</h2>
          </div>
          <p className="guide-text">{t('installationText')}</p>
        </section>

        <section className="ps-section guide-text-section" id="showroom">
          <div className="ps-header">
            <span className="section-tag">{t('testingTag')}</span>
            <h2>{t('testingTitle')}</h2>
          </div>
          <p className="guide-text">{t('testingText')}</p>
        </section>

        {/* ── ISO classes ──────────────────────────────────────────── */}
        <section className="ps-section hub-table-section guide-classes" id="iso-classes">
          <div className="ps-header">
            <span className="section-tag">{t('classesTag')}</span>
            <h2>{t('classesTitle')}</h2>
            <p>{t('classesText')}</p>
          </div>
          <div className="hub-table-wrap">
            <table className="hub-table guide-table guide-class-table">
              <thead>
                <tr>
                  <th scope="col">{t('classCol.class')}</th>
                  <th scope="col">{t('classCol.threshold')}</th>
                  <th scope="col">{t('classCol.models')}</th>
                </tr>
              </thead>
              <tbody>
                {ISO_CLASSES.map((c, i) => {
                  const max = i === 0 ? null : ISO_CLASSES[i - 1].min;
                  const inClass = classModels(c.min, max);
                  return (
                    <tr key={c.key} className={inClass ? 'guide-class-current' : undefined}>
                      <th scope="row">{t(`classRows.${c.key}`)}</th>
                      <td>{t('atLeast', { db: c.min })}</td>
                      <td>{inClass || NA}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="hub-table-footnote">{t('classesNote')}</p>
        </section>

        {/* ── End of life ──────────────────────────────────────────── */}
        <section className="ps-section guide-text-section" id="end-of-life">
          <div className="ps-header">
            <span className="section-tag">{t('endOfLifeTag')}</span>
            <h2>{t('endOfLifeTitle')}</h2>
          </div>
          <p className="guide-text">{t('endOfLifeText')}</p>
        </section>

        {/* ── FAQ (workbook rows tagged "guide") ───────────────────── */}
        <ProductFaq entries={faqEntries} tag={t('faqTag')} title={t('faqTitle')} />

        {/* ── Google reviews ───────────────────────────────────────── */}
        <Testimonials locale={locale} />

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="ps-section hub-cta">
          <div className="hub-cta-inner">
            <span className="section-tag">{t('ctaTag')}</span>
            <h2>{t('ctaTitle')}</h2>
            <p>{t('ctaText')}</p>
            <div className="hub-cta-buttons">
              <Link href="/contact" className="btn-primary" prefetch={false}>{t('ctaQuote')}</Link>
              <Link href="/where-to-buy" className="btn-secondary" prefetch={false}>{t('ctaShowroom')}</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
