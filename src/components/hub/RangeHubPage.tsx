import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import Breadcrumbs from '@/components/product/Breadcrumbs';
import ProductFaq from '@/components/product/ProductFaq';
import JsonLd from '@/components/seo/JsonLd';
import { SHOW_PLACEHOLDER_PRICES } from '@/config/site';
import { guidePath } from '@/data/guides';
import { HUBS, hubPath, type HubId } from '@/data/hubs';
import { faqFor, mergeFaqEntries } from '@/lib/content/faq';
import { PRODUCTS, isoSpeechClass, type Product } from '@/data/products';
import { Link } from '@/i18n/navigation';
import {
  breadcrumbSchema,
  collectionPageSchema,
  faqPageSchema,
  PLACEHOLDER_FROM_PRICE,
  type FaqEntry,
} from '@/lib/structured-data';

interface RangeHubPageProps {
  hubId: HubId;
  locale: string;
}

const NA = '—';

/** Price unit text → hubs.shared.units.* key (translated per locale). */
const UNIT_KEYS: Record<Product['priceUnit']['unitText'], string> = { 'per m²': 'm2', 'per booth': 'booth', 'per set': 'set', 'per piece': 'piece' };

/**
 * Range hub page (server component): H1 → intro → comparison table → model
 * cards → why Re-Sound → applications → FAQ → CTA, plus CollectionPage +
 * ItemList + BreadcrumbList + FAQPage JSON-LD. Everything is data-driven
 * from src/data/products.ts and the `hubs.*` message namespaces.
 */
export default async function RangeHubPage({ hubId, locale }: RangeHubPageProps) {
  const hub = HUBS[hubId];
  const t = await getTranslations({ locale, namespace: hub.namespace });
  const ts = await getTranslations({ locale, namespace: 'hubs.shared' });
  const tProducts = await getTranslations({ locale, namespace: 'products' });
  const tData = await getTranslations({ locale, namespace: 'productData' });
  const tm = await getTranslations({ locale, namespace: 'manufacturer' });

  const models = hub.models.map((slug) => PRODUCTS[slug]);
  const path = hubPath(hub, locale);
  const isBooth = hub.family === 'booth';

  const applications = Object.values(t.raw('applications') as Record<string, string>);
  // Hub FAQ (messages) + the workbook rows tagged for this hub, without duplicates
  const faqEntries: FaqEntry[] = mergeFaqEntries(
    Object.values(t.raw('faq') as Record<string, { question: string; answer: string }>),
    faqFor(locale, hubId).map((f) => ({ question: f.question, answer: f.answer }))
  );

  const crumbs = [
    { name: ts('breadcrumbHome'), href: '/' },
    { name: tProducts('pageTitle'), href: '/products' },
    { name: t('breadcrumb'), href: path },
  ];

  // From-price cell: confirmed prices always; placeholders only behind the flag.
  const unitOf = (p: Product) => ts(`units.${UNIT_KEYS[p.priceUnit.unitText]}`);
  const priceOf = (p: Product): string | null => {
    if (p.fromPrice !== null) return ts('fromPriceValue', { price: p.fromPrice, unit: unitOf(p) });
    if (SHOW_PLACEHOLDER_PRICES) return ts('fromPriceValue', { price: PLACEHOLDER_FROM_PRICE, unit: unitOf(p) }) + ' *';
    return null;
  };
  const showPrice = models.some((p) => priceOf(p) !== null);

  const finishes = (p: Product): string => {
    if (p.specs.kind !== 'panel' || p.specs.finishCount === null) return NA;
    return p.family === 'rwood'
      ? ts('finishesValue', { count: p.specs.finishCount })
      : ts('coloursValue', { count: p.specs.finishCount });
  };

  return (
    <>
      <JsonLd
        data={collectionPageSchema({
          name: t('h1'),
          description: t('description'),
          url: `/${locale}${path}`,
          locale,
          items: models.map((p) => ({
            name: tProducts(`${p.slug}.title`),
            url: `/${locale}/products/${p.slug}`,
            image: p.cardImage,
          })),
        })}
      />
      <JsonLd data={breadcrumbSchema(crumbs.map((c) => ({ name: c.name, url: `/${locale}${c.href === '/' ? '' : c.href}` })))} />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}

      <div className="hub-page">
        {/* ── Hero: H1 + intro ─────────────────────────────────────── */}
        <header className="hub-hero">
          <Breadcrumbs items={crumbs} />
          <h1>{t('h1')}</h1>
          <p className="hub-intro">{t('intro')}</p>
        </header>

        {/* ── Comparison table ─────────────────────────────────────── */}
        <section className="ps-section hub-table-section" id="compare">
          <div className="ps-header">
            <span className="section-tag">{ts('tableTag')}</span>
            <h2>{ts('tableTitle')}</h2>
            <p>{ts('tableNote')}</p>
          </div>
          <div className="hub-table-wrap">
            <table className="hub-table">
              <thead>
                <tr>
                  <th scope="col">{ts('col.model')}</th>
                  {isBooth ? (
                    <>
                      <th scope="col">{ts('col.capacity')}</th>
                      <th scope="col">{ts('col.footprint')}</th>
                      <th scope="col">{ts('col.dimensions')}</th>
                      <th scope="col">{ts('col.speech')}</th>
                      <th scope="col">{ts('col.isoClass')}</th>
                      <th scope="col">{ts('col.ventilation')}</th>
                      <th scope="col">{ts('col.power')}</th>
                      <th scope="col">{ts('col.weight')}</th>
                    </>
                  ) : (
                    <>
                      <th scope="col">{ts('col.format')}</th>
                      <th scope="col">{ts('col.thickness')}</th>
                      <th scope="col">{ts('col.alphaW')}</th>
                      <th scope="col">{ts('col.nrc')}</th>
                      <th scope="col">{ts('col.fireClass')}</th>
                      <th scope="col">{ts('col.recycled')}</th>
                      <th scope="col">{ts('col.finishes')}</th>
                      <th scope="col">{ts('col.mounting')}</th>
                    </>
                  )}
                  <th scope="col">{ts('col.leadTime')}</th>
                  {showPrice && <th scope="col">{ts('col.fromPrice')}</th>}
                </tr>
              </thead>
              <tbody>
                {models.map((p) => (
                  <tr key={p.slug}>
                    <th scope="row">
                      <Link href={`/products/${p.slug}`} prefetch={false}>{tProducts(`${p.slug}.title`)}</Link>
                    </th>
                    {p.specs.kind === 'booth' ? (
                      <>
                        <td>{p.specs.capacity}</td>
                        <td>{p.specs.footprint}</td>
                        <td>{p.specs.externalDimensions}</td>
                        <td>{p.specs.speechLevelReductionDbA !== null ? `${p.specs.speechLevelReductionDbA} dB(A)` : NA}</td>
                        <td>{isoSpeechClass(p.specs.speechLevelReductionDbA) ?? NA}</td>
                        <td>{p.specs.ventilation}</td>
                        <td>{p.specs.power}</td>
                        <td>{p.specs.weight}</td>
                      </>
                    ) : (
                      <>
                        <td>{p.specs.format ?? NA}</td>
                        <td>{p.specs.thickness ?? NA}</td>
                        <td>{p.specs.alphaW ?? NA}</td>
                        <td>{p.specs.nrc ?? NA}</td>
                        <td>{p.specs.fireClass ?? NA}</td>
                        <td>{p.recycledContentPct !== null ? `${p.recycledContentPct} %` : NA}</td>
                        <td>{finishes(p)}</td>
                        <td>{tData(`${p.slug}.mounting`)}</td>
                      </>
                    )}
                    <td>{tData(`${p.slug}.leadTime`)}</td>
                    {showPrice && <td>{priceOf(p) ?? ts('placeholderPrice')}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isBooth && <p className="hub-table-footnote">{ts('isoClassNote')}</p>}
          {isBooth && (
            <p className="hub-table-footnote">
              <Link href={guidePath(locale)} prefetch={false}>{ts('priceGuideLink')} →</Link>
            </p>
          )}
        </section>

        {/* ── Model cards ──────────────────────────────────────────── */}
        <section className="ps-section hub-models" id="models">
          <div className="ps-header">
            <span className="section-tag">{ts('modelsTag')}</span>
            <h2>{ts('modelsTitle')}</h2>
          </div>
          <ul className="ps-related-grid">
            {models.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`} className="ps-related-card" prefetch={false}>
                  <span className="ps-related-image">
                    <Image
                      src={p.cardImage}
                      alt={`${tProducts(`${p.slug}.title`)} — ${tProducts(`${p.slug}.description`)}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </span>
                  <span className="ps-related-body">
                    <span className="ps-related-name">{tProducts(`${p.slug}.title`)}</span>
                    <span className="ps-related-desc">{tProducts(`${p.slug}.description`)}</span>
                    <span className="ps-related-cta">{ts('viewModel')} →</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Why Re-Sound ─────────────────────────────────────────── */}
        <section className="ps-section hub-why">
          <div className="ps-header">
            <span className="section-tag">{ts('whyTag')}</span>
            <h2>{ts('whyTitle')}</h2>
          </div>
          <ul className="hub-why-grid">
            <li>
              <span className="hub-why-icon" aria-hidden="true">🏭</span>
              <h3>{ts('whyOwnFactoriesTitle')}</h3>
              <p>{tm('statement')}</p>
            </li>
            <li>
              <span className="hub-why-icon" aria-hidden="true">🔄</span>
              <h3>{ts('whyTakeBackTitle')}</h3>
              <p>{ts('whyTakeBackDesc')}</p>
            </li>
            <li>
              <span className="hub-why-icon" aria-hidden="true">✅</span>
              <h3>{ts('whyCertsTitle')}</h3>
              <p>{t('whyCertsDesc')}</p>
            </li>
          </ul>
        </section>

        {/* ── Applications ─────────────────────────────────────────── */}
        <section className="ps-section hub-applications">
          <div className="ps-header">
            <span className="section-tag">{ts('applicationsTag')}</span>
            <h2>{ts('applicationsTitle')}</h2>
          </div>
          <ul className="hub-applications-list">
            {applications.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <ProductFaq entries={faqEntries} tag={ts('faqTag')} title={ts('faqTitle')} />

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="ps-section hub-cta">
          <div className="hub-cta-inner">
            <span className="section-tag">{ts('ctaTag')}</span>
            <h2>{ts('ctaTitle')}</h2>
            <p>{ts('ctaText')}</p>
            <div className="hub-cta-buttons">
              <Link href="/contact?topic=samples" className="btn-primary" prefetch={false}>{ts('ctaSampleKit')}</Link>
              <Link href="/contact" className="btn-secondary" prefetch={false}>{ts('ctaQuote')}</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
