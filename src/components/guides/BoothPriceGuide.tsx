import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import PriceListGate from '@/components/guides/PriceListGate';
import Breadcrumbs from '@/components/product/Breadcrumbs';
import ProductFaq from '@/components/product/ProductFaq';
import type { Crumb } from '@/components/product/Breadcrumbs';
import { crumbsToSchema } from '@/components/product/productCrumbs';
import JsonLd from '@/components/seo/JsonLd';
import Testimonials from '@/components/testimonials/Testimonials';
import { guidePath } from '@/data/guides';
import { HUBS, hubPath } from '@/data/hubs';
import { PRODUCTS, isoSpeechClass } from '@/data/products';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/catalogue/format';
import { getCatalogue } from '@/lib/catalogue/load';
import { priceTokenCents } from '@/lib/catalogue/tokens';
import type { Catalogue } from '@/lib/catalogue/types';

/**
 * The guide's intro and meta description name the Solo ECO, Solo Flex and
 * Modular XL "from" prices as ICU arguments ({soloEco}, {soloFlex},
 * {modularXl}), filled here from
 * the catalogue so the sentence never carries a stale figure.
 */
export function guidePriceArgs(catalogue: Catalogue, locale: string, onRequest: string): { soloEco: string; soloFlex: string; modularXl: string } {
  const fmt = (slug: string) => {
    const cents = priceTokenCents(catalogue, undefined, slug);
    return cents === null ? onRequest : formatPrice(cents, locale);
  };
  return { soloEco: fmt('solo-eco'), soloFlex: fmt('solo-flex'), modularXl: fmt('modular-xl') };
}
import { categoryLabel, lineLabel } from '@/lib/catalogue/pricing';
import { articleSuffix, articlesFor } from '@/lib/catalogue/select';
import type { CatalogueArticle } from '@/lib/catalogue/types';
import { getBoothGuide } from '@/lib/content/boothGuide';
import { faqForResolved } from '@/lib/content/faq';
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

/**
 * Booth price guide (server component): H1 → intro → price/spec table →
 * what is included → installation → showroom → ISO classes → end of life →
 * FAQ (rows tagged "guide") → Google reviews → CTA.
 *
 * Every price comes from the catalogue (database, else the committed
 * snapshot — src/lib/catalogue/load.ts): the lowest base price of the models
 * sold from each page, the glass-backwall base price, the Modular XL
 * extension articles and the installation line (on request until Re-Sound
 * publishes a figure). Facts come from content/booth-guide.json (Booth_Guide
 * sheet) and src/data/products.ts. JSON-LD: BreadcrumbList + one FAQPage.
 */
export default async function BoothPriceGuide({ locale }: BoothPriceGuideProps) {
  const t = await getTranslations({ locale, namespace: 'boothGuide' });
  const ts = await getTranslations({ locale, namespace: 'hubs.shared' });
  const tHub = await getTranslations({ locale, namespace: 'hubs.booths' });
  const tData = await getTranslations({ locale, namespace: 'productData' });
  const tm = await getTranslations({ locale, namespace: 'manufacturer' });

  const guide = getBoothGuide();
  const catalogue = await getCatalogue();
  const models = guide.models
    .map((row) => ({ row, product: PRODUCTS[row.slug] }))
    .filter((m) => m.product && m.product.specs.kind === 'booth');
  type Model = (typeof models)[number];
  const money = (cents: number | null | undefined) =>
    cents === null || cents === undefined ? t('onRequest') : formatPrice(cents, locale);

  // Catalogue view per page slug: the models sold from that page and their articles.
  const articlesOf = (slug: string) =>
    catalogue.products.filter((p) => p.active && p.websiteSlug === slug).flatMap((p) => articlesFor(p.id, catalogue));
  const lowest = (articles: CatalogueArticle[]) =>
    articles.reduce<number | null>(
      (min, a) => (a.priceCents !== null && (min === null || a.priceCents < min) ? a.priceCents : min),
      null,
    );
  const basePrice = (slug: string) => lowest(articlesOf(slug).filter((a) => a.priceType === 'base'));
  // Glass backwall: the base article whose code ends in -BG (RS-SF-BG …).
  const glassArticles = (slug: string) => articlesOf(slug).filter((a) => a.priceType === 'base' && articleSuffix(a.code) === 'BG');
  const extensions = (slug: string) => articlesOf(slug).filter((a) => a.categoryKey === 'additional_segments');
  const installation = (slug: string) => articlesOf(slug).find((a) => a.categoryKey === 'installation');
  // Labels of catalogue-defined rows come from the catalogue too (translated through its labels).
  const glassLabelArticle = models.map((m) => glassArticles(m.row.slug)[0]).find((a) => a !== undefined);
  const installationCategory = catalogue.categories.find((c) => c.key === 'installation');

  const hub = HUBS.booths;
  const path = guidePath(locale);
  const crumbs: Crumb[] = [
    { name: ts('breadcrumbHome'), href: '/' },
    { name: tHub('breadcrumb'), href: hubPath(hub, locale) },
    { name: t('breadcrumb'), href: path },
  ];

  const faqEntries: FaqEntry[] = (await faqForResolved(locale, 'guide')).map((f) => ({ question: f.question, answer: f.answer }));

  const classModels = (min: number, max: number | null) =>
    models
      .filter((m) => {
        const db = m.product.specs.kind === 'booth' ? m.product.specs.speechLevelReductionDbA : null;
        return db !== null && db >= min && (max === null || db < max);
      })
      .map((m) => `${m.product.name} (${m.row.isoDbA ?? ''} dB(A))`)
      .join(' · ');

  const rows: Array<{ label: string; cell: (m: Model) => ReactNode }> = [
    { label: t('col.capacity'), cell: (m) => (m.row.slug === 'modular-xl' ? t('personsRange') : t('persons', { count: Number(m.row.capacity) || 1 })) },
    { label: t('col.footprint'), cell: (m) => (m.product.specs.kind === 'booth' ? m.product.specs.footprint : NA) },
    { label: t('col.dimensions'), cell: (m) => (m.product.specs.kind === 'booth' ? m.product.specs.externalDimensions : NA) },
    { label: t('col.priceExcl'), cell: (m) => money(basePrice(m.row.slug)) },
    ...(glassLabelArticle
      ? [{ label: lineLabel(glassLabelArticle, locale), cell: (m: Model) => money(lowest(glassArticles(m.row.slug))) }]
      : []),
    {
      label: t('col.extra'),
      cell: (m) => {
        const ext = extensions(m.row.slug);
        if (ext.length === 0) return NA;
        return ext.map((a) => (
          <span key={a.code} style={{ display: 'block' }}>
            {lineLabel(a, locale)}: {money(a.priceCents)}
          </span>
        ));
      },
    },
    ...(installationCategory
      ? [{
          label: categoryLabel(installationCategory, locale),
          cell: (m: Model) => {
            const line = installation(m.row.slug);
            return line ? money(line.priceCents) : NA;
          },
        }]
      : []),
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
    // Per-model warranty where the list words it differently (Solo ECO: spare-part warranty), else the shared value.
    { label: t('col.warranty'), cell: (m) => (t.has(`warrantyByModel.${m.row.slug}`) ? t(`warrantyByModel.${m.row.slug}`) : t('warrantyValue')) },
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
          <p className="hub-intro">{t('intro', guidePriceArgs(catalogue, locale, t('onRequest')))}</p>
          {/* Manufacture line next to the price intro; the group statement is the shared manufacturer.statement key, never copied into this namespace. */}
          <p className="hub-intro guide-manufacture">{t('manufactureLine')} {tm('statement')}</p>
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

        {/* ── Price-list download (lead gate, client island) ───────── */}
        <PriceListGate
          locale={locale}
          labels={{
            tag: t('pricelist.tag'),
            title: t('pricelist.title'),
            text: t('pricelist.text'),
            firstName: t('pricelist.firstName'),
            lastName: t('pricelist.lastName'),
            company: t('pricelist.company'),
            email: t('pricelist.email'),
            honeypot: t('pricelist.honeypot'),
            consent: t.rich('pricelist.consent', {
              link: (chunks) => <Link href="/privacy" prefetch={false}>{chunks}</Link>,
            }),
            submit: t('pricelist.submit'),
            sending: t('pricelist.sending'),
            successTitle: t('pricelist.successTitle'),
            successText: t('pricelist.successText'),
            successLink: t('pricelist.successLink'),
            errorInvalid: t('pricelist.errorInvalid'),
            error: t('pricelist.error'),
          }}
        />

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
