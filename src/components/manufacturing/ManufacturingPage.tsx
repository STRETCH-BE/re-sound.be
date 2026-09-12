import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import Breadcrumbs, { type Crumb } from '@/components/product/Breadcrumbs';
import { crumbsToSchema } from '@/components/product/productCrumbs';
import JsonLd from '@/components/seo/JsonLd';
import Icon, { type IconName } from '@/components/ui/Icon';
import { PLANTS, PRODUCTION_OFFICE, SHOWROOM, type PlantCountry } from '@/config/site';
import { HUBS, HUB_IDS, hubForFamily, hubPath, type Hub, type HubId } from '@/data/hubs';
import { manufacturingPath } from '@/data/manufacturing';
import { FAMILY_PRODUCTS, PRODUCTS, PRODUCT_SLUGS, type Certification, type ProductFamily } from '@/data/products';
import { Link } from '@/i18n/navigation';
import { breadcrumbSchema, manufacturingOrganizationSchema, plantSchema } from '@/lib/structured-data';

interface ManufacturingPageProps {
  locale: string;
}

const NA = '—';

/**
 * TODO(needs-Michael): there is no photograph of either plant in
 * public/images (only product shots). While an entry is null the card shows
 * a neutral block — never a stock photo. Set a root-relative path under
 * public/ (e.g. '/images/plants/beveren-waas.webp') to show the real one.
 */
const PLANT_PHOTO_PLACEHOLDER: Record<PlantCountry, string | null> = { BE: null, PL: null };

/** Catalogue order of the families in the plant cards and the origin table. */
const FAMILY_ORDER: ProductFamily[] = ['textile', 'rwood', 'rpet', 'booth'];

/** Display order of the certifications; only those present in product data render. */
const CERT_ORDER: Certification[] = ['FSC', 'OEKO-TEX', 'EPD'];

const CERT_ICON: Record<Certification, IconName> = { FSC: 'tree', 'OEKO-TEX': 'shield', EPD: 'document' };

interface PlantContact {
  streetAddress: string;
  postalCode: string;
  locality: string;
  phones: { number: string; href: string; note?: string }[];
  email: string;
}

/**
 * Contact facts per plant, from config/site.ts only: the Belgian plant
 * shares the head-office / showroom address (SHOWROOM), the Polish one the
 * production-office address and phones (PRODUCTION_OFFICE). The schema.org
 * phone format '+32-3-284-68-18' is shown with spaces, as on /where-to-buy.
 */
const PLANT_CONTACT: Record<PlantCountry, PlantContact> = {
  BE: {
    streetAddress: SHOWROOM.streetAddress,
    postalCode: SHOWROOM.postalCode,
    locality: SHOWROOM.addressLocality,
    phones: [{ number: SHOWROOM.telephone.replace(/-/g, ' '), href: SHOWROOM.telephoneHref }],
    email: SHOWROOM.email,
  },
  PL: {
    streetAddress: PRODUCTION_OFFICE.streetAddress,
    postalCode: PRODUCTION_OFFICE.postalCode,
    locality: PRODUCTION_OFFICE.addressLocality,
    phones: PRODUCTION_OFFICE.phones.map((p) => ({ number: p.number, href: `tel:${p.number.replace(/\s+/g, '')}`, note: p.languages })),
    email: PRODUCTION_OFFICE.email,
  },
};

/** Slugs made at a plant, in catalogue order — from PRODUCTS[slug].madeIn, never from copy. */
function productsAt(country: PlantCountry): string[] {
  return FAMILY_ORDER.flatMap((f) => FAMILY_PRODUCTS[f]).filter((slug) => PRODUCTS[slug].madeIn === country);
}

/** Range hubs of the families made at a plant (textile has no hub). */
function hubsAt(country: PlantCountry): Hub[] {
  const out: Hub[] = [];
  for (const family of FAMILY_ORDER) {
    if (!FAMILY_PRODUCTS[family].some((slug) => PRODUCTS[slug].madeIn === country)) continue;
    const hub = hubForFamily(family);
    if (hub && !out.includes(hub)) out.push(hub);
  }
  return out;
}

/**
 * Manufacturing page (server component): H1 → intro + group statement →
 * the two plant cards → per-line origin table → certifications → how we
 * work → links (hubs, downloads, samples) → CTA, plus Organization (with
 * parentOrganization and the plant locations), one LocalBusiness per plant
 * and BreadcrumbList JSON-LD.
 *
 * Every fact is read from src/config/site.ts, src/data/products.ts or an
 * existing message (manufacturer.*, hubs.*, productData.*); the
 * `manufacturing.*` namespace holds copy only.
 */
export default async function ManufacturingPage({ locale }: ManufacturingPageProps) {
  const t = await getTranslations({ locale, namespace: 'manufacturing' });
  const tm = await getTranslations({ locale, namespace: 'manufacturer' });
  const ts = await getTranslations({ locale, namespace: 'hubs.shared' });
  const tBooths = await getTranslations({ locale, namespace: 'hubs.booths' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tData = await getTranslations({ locale, namespace: 'productData' });

  const path = manufacturingPath(locale);
  const pageUrl = `/${locale}${path}`;

  const crumbs: Crumb[] = [
    { name: ts('breadcrumbHome'), href: '/' },
    { name: t('breadcrumb'), href: path },
  ];

  const plantName = (country: PlantCountry) => tm(`plant.${country}`);
  const rangeLabel = (id: HubId) => tNav(`range${id.charAt(0).toUpperCase()}${id.slice(1)}`);

  // Certifications, computed from product data: one entry per certification
  // that at least one product carries, with the products it applies to.
  const certifications = CERT_ORDER.map((id) => ({
    id,
    products: PRODUCT_SLUGS.filter((slug) => PRODUCTS[slug].certifications.includes(id)),
  })).filter((c) => c.products.length > 0);

  const tableRows = FAMILY_ORDER.flatMap((f) => FAMILY_PRODUCTS[f]).map((slug) => PRODUCTS[slug]);

  return (
    <>
      <JsonLd data={manufacturingOrganizationSchema()} />
      {PLANTS.map((plant) => (
        <JsonLd
          key={plant.country}
          data={plantSchema({
            country: plant.country,
            name: `Re-Sound — ${plantName(plant.country)}`,
            description: t(`plant.${plant.country}.makes`),
            url: pageUrl,
          })}
        />
      ))}
      <JsonLd data={breadcrumbSchema(crumbsToSchema(locale, crumbs))} />

      <div className="hub-page mfg-page">
        {/* ── Hero: H1 + intro + the one group statement ────────────── */}
        <header className="hub-hero">
          <Breadcrumbs items={crumbs} />
          <h1>{t('h1')}</h1>
          <p className="hub-intro">{t('intro')}</p>
          {/* The shared manufacturer.statement key, reused — never copied into this namespace. */}
          <p className="hub-intro mfg-statement">{tm('statement')}</p>
        </header>

        {/* ── The two plants ────────────────────────────────────────── */}
        <section className="ps-section mfg-plants" id="plants">
          <div className="ps-header">
            <span className="section-tag">{t('plantsTag')}</span>
            <h2>{t('plantsTitle')}</h2>
            <p>{t('plantsIntro')}</p>
          </div>
          <ul className="mfg-plant-grid">
            {PLANTS.map((plant) => {
              const country = plant.country;
              const contact = PLANT_CONTACT[country];
              const photo = PLANT_PHOTO_PLACEHOLDER[country];
              const made = productsAt(country);
              const hubs = hubsAt(country);
              return (
                <li key={country} className="mfg-plant" id={`plant-${country.toLowerCase()}`}>
                  {photo ? (
                    <span className="mfg-plant-photo">
                      <Image src={photo} alt={plantName(country)} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                    </span>
                  ) : (
                    <span className="mfg-plant-photo mfg-plant-photo--placeholder" aria-hidden="true">
                      <Icon name="factory" size={56} />
                    </span>
                  )}
                  <div className="mfg-plant-body">
                    <p className="mfg-plant-role">{t(`plant.${country}.role`)}</p>
                    <h3>{plantName(country)}</h3>
                    <p>{t(`plant.${country}.makes`)}</p>
                    <dl className="mfg-plant-meta">
                      <div className="mfg-plant-meta--wide">
                        <dt>{t('plantLabels.makes')}</dt>
                        <dd>
                          {made.length > 0
                            ? made.map((slug, i) => (
                                <span key={slug}>
                                  {i > 0 && ', '}
                                  <Link href={`/products/${slug}`} prefetch={false}>{PRODUCTS[slug].name}</Link>
                                </span>
                              ))
                            : NA}
                        </dd>
                      </div>
                      <div>
                        <dt>{t('plantLabels.address')}</dt>
                        <dd>
                          {contact.streetAddress}
                          <br />
                          {contact.postalCode} {contact.locality}, {t(`plantLabels.country.${country}`)}
                        </dd>
                      </div>
                      <div>
                        <dt>{t('plantLabels.hours')}</dt>
                        <dd>{t('plantLabels.hoursValue')}</dd>
                      </div>
                      <div>
                        <dt>{t('plantLabels.phone')}</dt>
                        <dd>
                          {contact.phones.map((p) => (
                            <span key={p.number} className="mfg-plant-phone">
                              <a href={p.href}>{p.number}</a>
                              {p.note ? ` (${p.note})` : ''}
                            </span>
                          ))}
                        </dd>
                      </div>
                      <div>
                        <dt>{t('plantLabels.email')}</dt>
                        <dd>
                          <a href={`mailto:${contact.email}`}>{contact.email}</a>
                        </dd>
                      </div>
                    </dl>
                    <p>{t(`plant.${country}.note`)}</p>
                    <div className="mfg-plant-links">
                      {hubs.length > 0 ? (
                        hubs.map((hub) => (
                          <Link key={hub.id} href={hubPath(hub, locale)} prefetch={false}>{rangeLabel(hub.id)} →</Link>
                        ))
                      ) : (
                        <Link href="/products" prefetch={false}>{t('links.downloadsCta')} →</Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Origin per product line (driven by PRODUCTS[slug].madeIn) ── */}
        <section className="ps-section hub-table-section" id="origin">
          <div className="ps-header">
            <span className="section-tag">{t('originTag')}</span>
            <h2>{t('originTitle')}</h2>
            <p>{t('originNote')}</p>
          </div>
          <div className="hub-table-wrap">
            <table className="hub-table mfg-origin-table">
              <caption className="visually-hidden">{t('originTitle')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('col.product')}</th>
                  <th scope="col">{t('col.family')}</th>
                  <th scope="col">{t('col.plant')}</th>
                  <th scope="col">{t('col.leadTime')}</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((p) => (
                  <tr key={p.slug}>
                    <th scope="row">
                      <Link href={`/products/${p.slug}`} prefetch={false}>{p.name}</Link>
                    </th>
                    <td>{tData(`familyName.${p.family}`)}</td>
                    {/* Plant name via manufacturer.plant.* — never a blanket "made in" claim. */}
                    <td>{p.madeIn ? tm(`plant.${p.madeIn}`) : NA}</td>
                    <td>{tData.has(`${p.slug}.leadTime`) ? tData(`${p.slug}.leadTime`) : NA}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Certifications (computed from PRODUCTS[*].certifications) ── */}
        <section className="ps-section mfg-certs" id="certifications">
          <div className="ps-header">
            <span className="section-tag">{t('certsTag')}</span>
            <h2>{t('certsTitle')}</h2>
            <p>{t('certsIntro')}</p>
          </div>
          <ul className="mfg-cert-list">
            {certifications.map((c) => (
              <li key={c.id} className="mfg-cert">
                <span className="mfg-cert-icon">
                  <Icon name={CERT_ICON[c.id]} size={28} />
                </span>
                <div>
                  <h3>{t(`certs.${c.id}.name`)}</h3>
                  <p className="mfg-cert-scope">{t(`certs.${c.id}.scope`)}</p>
                  <p className="mfg-cert-products">
                    {t('certsAppliesTo')}:{' '}
                    {c.products.map((slug, i) => (
                      <span key={slug}>
                        {i > 0 && ', '}
                        <Link href={`/products/${slug}`} prefetch={false}>{PRODUCTS[slug].name}</Link>
                      </span>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mfg-cert-note">{t('certsNote')}</p>
        </section>

        {/* ── How we work ───────────────────────────────────────────── */}
        <section className="ps-section hub-why mfg-how">
          <div className="ps-header">
            <span className="section-tag">{t('howTag')}</span>
            <h2>{t('howTitle')}</h2>
          </div>
          <ul className="hub-why-grid">
            <li>
              <h3>{t('how.origin.title')}</h3>
              <p>{t('how.origin.text')}</p>
            </li>
            <li>
              <h3>{t('how.installation.title')}</h3>
              <p>{t('how.installation.text')}</p>
            </li>
            <li>
              <h3>{ts('whyTakeBackTitle')}</h3>
              <p>{ts('whyTakeBackDesc')}</p>
            </li>
            <li>
              <h3>{t('how.warranty.title')}</h3>
              {/* The booth hub's warranty sentence, reused as is. */}
              <p>{tBooths('whyCertsDesc')}</p>
            </li>
          </ul>
        </section>

        {/* ── Links: range hubs, technical downloads, sample kit ────── */}
        <section className="ps-section mfg-links" id="links">
          <div className="ps-header">
            <span className="section-tag">{t('linksTag')}</span>
            <h2>{t('linksTitle')}</h2>
          </div>
          <ul className="ps-related-grid">
            {HUB_IDS.map((id) => (
              <li key={id}>
                <Link href={hubPath(HUBS[id], locale)} className="ps-related-card mfg-link-card" prefetch={false}>
                  <span className="ps-related-body">
                    <span className="ps-related-name">{rangeLabel(id)}</span>
                    <span className="ps-related-desc">{HUBS[id].models.map((slug) => PRODUCTS[slug].name).join(' · ')}</span>
                    <span className="ps-related-cta">{t('links.hubCta')} →</span>
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products" className="ps-related-card mfg-link-card" prefetch={false}>
                <span className="ps-related-body">
                  <span className="ps-related-name">{t('links.downloadsTitle')}</span>
                  <span className="ps-related-desc">{t('links.downloadsText')}</span>
                  <span className="ps-related-cta">{t('links.downloadsCta')} →</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/samples" className="ps-related-card mfg-link-card" prefetch={false}>
                <span className="ps-related-body">
                  <span className="ps-related-name">{t('links.samplesTitle')}</span>
                  <span className="ps-related-desc">{t('links.samplesText')}</span>
                  <span className="ps-related-cta">{ts('ctaSampleKit')} →</span>
                </span>
              </Link>
            </li>
          </ul>
        </section>

        {/* ── CTA (shared hub copy) ─────────────────────────────────── */}
        <section className="ps-section hub-cta">
          <div className="hub-cta-inner">
            <span className="section-tag">{ts('ctaTag')}</span>
            <h2>{ts('ctaTitle')}</h2>
            <p>{ts('ctaText')}</p>
            <div className="hub-cta-buttons">
              <Link href="/samples" className="btn-primary" prefetch={false}>{ts('ctaSampleKit')}</Link>
              <Link href="/contact" className="btn-secondary" prefetch={false}>{ts('ctaQuote')}</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
