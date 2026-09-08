'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { analytics } from '@/lib/analytics';
import { PRODUCTS } from '@/data/products';
import type { ConfiguratorData } from '@/lib/catalogue/load';
import { localeFullCodes, type Locale } from '@/i18n/config';
import OrderModal from './OrderModal';

/**
 * "Order online" button plus its dialog. Renders nothing when the catalogue
 * sells no model from this page — those keep the quote route.
 */
export default function OrderButton({
  slug,
  configurator,
  className = 'btn-primary',
}: {
  /** Product page slug (the models' websiteSlug) */
  slug: string;
  /** Models, categories and articles of this page, loaded on the server */
  configurator: ConfiguratorData | null | undefined;
  className?: string;
}) {
  const t = useTranslations('order');
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  if (!configurator || configurator.products.length === 0) return null;
  const productName = PRODUCTS[slug]?.name ?? configurator.products[0].name;

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          analytics.orderStarted(slug);
          setOpen(true);
        }}
      >
        {t('cta')}
      </button>
      <OrderModal
        open={open}
        onClose={() => setOpen(false)}
        slug={slug}
        productName={productName}
        configurator={configurator}
        locale={locale}
        localeTag={localeFullCodes[locale as Locale] ?? 'en-BE'}
      />
    </>
  );
}
