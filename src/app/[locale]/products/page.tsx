// Solutions overview (/products). Hero + a card per product in the catalogue,
// plus an ItemList + BreadcrumbList JSON-LD. Each card links to its solution
// page.
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl } from '@/lib/site-config';
import { products } from '@/lib/products';
import { localizeProduct, type CatalogEntry } from '@/lib/localize-product';
import { productImage, pimg } from '@/lib/product-images';
import { pageMetadata } from '@/lib/page-meta';
import { breadcrumbSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import { ModalButton } from '@/components/ui/ModalButton';
import { localeBase } from '@/lib/seo';

// Products shown as "Coming soon" on the overview grid (still link through to
// their page). Add a slug here to flag another product.
const COMING_SOON: string[] = [];

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/products', titleKey: 'productsTitle', descKey: 'productsDescription' });
}

export default async function ProductsPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('productsPage');
  const tc = await getTranslations('catalog');
  const tp = await getTranslations('productPage');

  // Sub-pages (starry sky, inspection hatch) are flagged listed:false — they
  // have their own pages + mega-menu links but don't appear as overview cards.
  const listed = products
    .filter((p) => p.listed !== false)
    .map((p) => localizeProduct(p, tc.raw(p.key) as CatalogEntry));

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: listed.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${localeBase(locale)}/products/${p.slug}`,
    })),
  };
  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: tp('solutions'), url: `${localeBase(locale)}/products` },
  ]);

  return (
    <>
      <JsonLd data={itemList} />
      <JsonLd data={crumbs} />

      {/* Hero */}
      <section className="container" style={{ padding: 'clamp(36px,5vw,72px) 0 clamp(28px,3vw,44px)' }}>
        <Eyebrow num="01" label={t('eyebrow')} />
        <h1 className="h1" style={{ margin: '0 0 clamp(20px,2vw,28px)' }}>
          {t('title1')}
          <br />
          <span className="accent">{t('title2accent')}</span> {t('title2rest')}
        </h1>
        <p className="lead" style={{ maxWidth: 560, margin: 0 }}>
          {t('lead')}
        </p>
      </section>

      {/* Product grid */}
      <section className="container" style={{ paddingBottom: 'clamp(50px,6vw,90px)' }}>
        <div className="prod-grid">
          {listed.map((p) => {
            const soon = COMING_SOON.includes(p.slug);
            return (
              <Link key={p.slug} href={`/products/${p.slug}`} className="prod-card zoom-wrap">
                <div style={{ overflow: 'hidden', position: 'relative' }}>
                  {soon && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        zIndex: 2,
                        background: 'var(--red)',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '.14em',
                        textTransform: 'uppercase',
                        padding: '7px 12px',
                      }}
                    >
                      {t('comingSoon')}
                    </span>
                  )}
                  <Placeholder
                    label={`${p.name}`}
                    src={pimg(productImage(p.slug).hero, '16/10').src}
                    alt={p.name}
                    sizes="(max-width: 900px) 100vw, 33vw"
                    light
                    ratio="16/10"
                    className="zoom-img"
                    decorative
                  />
                </div>
                <div className="prod-card__body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--red)' }}>{p.mount}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{p.category}</span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px,2.6vw,32px)', letterSpacing: '-.02em', textTransform: 'uppercase', margin: '0 0 12px' }}>{p.short}</h2>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-muted)', margin: '0 0 18px' }}>{p.summary}</p>
                  <ul style={{ listStyle: 'none', margin: '0 0 20px', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {p.chips.slice(0, 3).map((c) => (
                      <li key={c} style={{ fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', padding: '6px 11px', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 6, height: 6, background: 'var(--red)' }} />{c}
                      </li>
                    ))}
                  </ul>
                  <span className="lnk" style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '.04em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                    {soon ? t('preview') : t('explore', { name: p.short })} <span style={{ color: 'var(--red)' }}>→</span>
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Trailing CTA cell */}
          <div className="prod-card prod-card--cta">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px,2.6vw,32px)', letterSpacing: '-.02em', textTransform: 'uppercase', margin: '0 0 14px', color: '#fff' }}>
                {t('notSure')}
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--on-dark-soft)', margin: '0 0 24px' }}>
                {t('notSureBody')}
              </p>
            </div>
            <ModalButton type="quote" source="products_grid" trackQuote className="btn btn--primary" style={{ alignSelf: 'flex-start' }}>
              {t('quote')} <ArrowRight size={16} />
            </ModalButton>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .prod-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .prod-card { border: 1px solid var(--border); background: #fff; text-decoration: none; display: flex; flex-direction: column; }
        .prod-card__body { padding: clamp(22px,2.4vw,30px); display: flex; flex-direction: column; flex: 1; }
        .prod-card--cta { background: var(--black); padding: clamp(26px,3vw,38px); justify-content: space-between; gap: 20px; }
        @media (max-width: 900px) { .prod-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .prod-grid { grid-template-columns: 1fr; } }
      ` }} />
    </>
  );
}
