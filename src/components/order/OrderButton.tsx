'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { analytics } from '@/lib/analytics';
import { PRODUCTS } from '@/data/products';
import { isOrderable } from '@/lib/order/catalogue';
import { localeFullCodes, type Locale } from '@/i18n/config';
import OrderModal from './OrderModal';

/**
 * "Order online" button plus its dialog. Renders nothing for a product that
 * has no confirmed price — those keep the quote route.
 */
export default function OrderButton({
  slug,
  namespace,
  className = 'btn-primary',
}: {
  slug: string;
  /** Translation namespace of the product page (add-on labels) */
  namespace: string;
  className?: string;
}) {
  const t = useTranslations('order');
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  if (!isOrderable(slug)) return null;
  const productName = PRODUCTS[slug]?.name ?? slug;

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
        namespace={namespace}
        locale={locale}
        localeTag={localeFullCodes[locale as Locale] ?? 'en-BE'}
      />
    </>
  );
}
