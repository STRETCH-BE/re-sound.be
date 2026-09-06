import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { guidePath, isGuideLocale } from '@/data/guides';
import { hubForFamily, hubPath } from '@/data/hubs';
import { FAMILY_PRODUCTS, PRODUCTS } from '@/data/products';

interface OtherModelsProps {
  /** Current product — its siblings in the same family are listed */
  slug: string;
  /** Routing locale, needed for the localised range-hub link */
  locale: string;
}

/**
 * "Other models in this range" — server component.
 *
 * Cards for the sibling products of the same family (textile / rWood /
 * rPET / booths), using the card image from product data and the short
 * blurb from the `products` namespace.
 */
export default async function OtherModels({ slug, locale }: OtherModelsProps) {
  const t = await getTranslations('productPage.related');
  const tProducts = await getTranslations('products');
  const tNav = await getTranslations('nav');
  const product = PRODUCTS[slug];
  const hub = hubForFamily(product.family);
  const siblings = FAMILY_PRODUCTS[product.family].filter((s) => s !== slug);
  if (siblings.length === 0) return null;

  return (
    <section id="other-models" className="ps-section ps-related">
      <div className="ps-header">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>
      </div>

      <ul className="ps-related-grid">
        {siblings.map((s) => {
          const p = PRODUCTS[s];
          return (
            <li key={s}>
              <Link href={`/products/${s}`} className="ps-related-card" prefetch={false}>
                <span className="ps-related-image">
                  <Image
                    src={p.cardImage}
                    alt={`${tProducts(`${s}.title`)} — ${tProducts(`${s}.description`)}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    style={{ objectFit: 'cover' }}
                  />
                </span>
                <span className="ps-related-body">
                  <span className="ps-related-name">{tProducts(`${s}.title`)}</span>
                  <span className="ps-related-desc">{tProducts(`${s}.description`)}</span>
                  <span className="ps-related-cta">{tProducts('learnMore')} →</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {hub && (
        <p className="ps-related-range">
          <Link href={hubPath(hub, locale)} prefetch={false}>
            {t('rangeLink', { range: tNav(`range${hub.id.charAt(0).toUpperCase()}${hub.id.slice(1)}`) })} →
          </Link>
        </p>
      )}
      {product.family === 'booth' && isGuideLocale(locale) && (
        <p className="ps-related-range">
          <Link href={guidePath(locale)} prefetch={false}>{t('priceGuide')} →</Link>
        </p>
      )}
    </section>
  );
}
