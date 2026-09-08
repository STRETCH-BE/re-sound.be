'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { categoryLabel, lineLabel } from '@/lib/catalogue/pricing';
import { POWER_SOCKET_CATEGORY, type CatalogueSlice } from '@/lib/catalogue/select';
import type { CatalogueArticle, CatalogueProduct, Selection } from '@/lib/catalogue/types';

import {
  chooseSingle,
  groupsFor,
  layoutFor,
  modelFromPrice,
  money as formatMoney,
  priceEffect,
  toggleMulti,
  type CategoryGroup,
  type PricedOrder,
} from './configurator';

/**
 * Step 1 of the order dialog: model, quantity, then one control group per
 * catalogue category of the chosen model. Every label and every amount comes
 * from the catalogue slice the page handed down; this component only decides
 * how a category is laid out and reports the buyer's choices upward.
 */
interface Props {
  slice: CatalogueSlice;
  /** Models sold from this page, in catalogue order */
  models: CatalogueProduct[];
  product: CatalogueProduct;
  selection: Selection;
  /** Priced selection, for the per-segment hint and the per-unit figure */
  priced: PricedOrder | null;
  locale: string;
  localeTag: string;
  onModel: (productId: string) => void;
  onSelect: (next: Selection) => void;
  /** The buyer picked a socket by hand: stop matching it to the country */
  onSocketTouched: () => void;
}

export default function Configurator({
  slice,
  models,
  product,
  selection,
  priced,
  locale,
  localeTag,
  onModel,
  onSelect,
  onSocketTouched,
}: Props) {
  const t = useTranslations('order');
  // The field keeps its own text so clearing it leaves an empty box instead of
  // snapping back to 1, which turned "clear, type 2" into 12.
  const [quantityText, setQuantityText] = useState(String(selection.quantity));

  const money = (cents: number) => formatMoney(cents, localeTag);
  const chosen = new Set(selection.articles);
  const groups = groupsFor(product, slice);
  const unit = t(`units.${product.unit}`);

  const clampQuantity = (value: number) => Math.min(product.maxQty, Math.max(1, Math.floor(value)));
  const setQuantity = (value: number) => {
    const next = clampQuantity(value);
    setQuantityText(String(next));
    if (next !== selection.quantity) onSelect({ ...selection, quantity: next });
  };

  /** The price label next to a control: full price, "Included", "+€ x", "−€ x" or "On request". */
  const effectText = (article: CatalogueArticle): string => {
    const effect = priceEffect(article);
    switch (effect.kind) {
      case 'base':
        return money(effect.cents);
      case 'included':
        return t('configure.included');
      case 'credit':
        return t('configure.creditPrice', { price: money(effect.cents) });
      case 'onRequest':
        return t('summary.onRequest');
      case 'option':
        return article.perSegment
          ? t('configure.perSegmentPrice', { price: money(effect.cents) })
          : t('configure.optionPrice', { price: money(effect.cents) });
    }
  };

  /** Modular XL fire protection: "× 4 segments = € x per booth", so the buyer sees why. */
  const segmentsHint = (article: CatalogueArticle): string | null => {
    if (!article.perSegment || article.priceCents === null || !priced || priced.segments === null) return null;
    return t('configure.segmentsLine', {
      segments: priced.segments,
      amount: money(article.priceCents * priced.segments),
      unit,
    });
  };

  const pick = (group: CategoryGroup, code: string | null) => {
    onSelect({ ...selection, articles: chooseSingle(selection.articles, group, code) });
    if (group.category.key === POWER_SOCKET_CATEGORY) onSocketTouched();
  };
  const toggle = (code: string, on: boolean) =>
    onSelect({ ...selection, articles: toggleMulti(selection.articles, code, on) });

  return (
    <div className="cf">
      {models.length > 1 && (
        <fieldset className="cf-models">
          <legend>{t('configure.model')}</legend>
          <div className="cf-model-list">
            {models.map((m) => {
              const from = modelFromPrice(m, slice);
              const active = m.id === product.id;
              return (
                <label key={m.id} className={`cf-model${active ? ' active' : ''}`}>
                  <input type="radio" name="order-model" value={m.id} checked={active} onChange={() => onModel(m.id)} />
                  <span className="cf-model-text">
                    <span className="cf-model-name">{m.name}</span>
                    {m.description && <span className="cf-model-desc">{m.description}</span>}
                    {from !== null && <span className="cf-model-price">{t('configure.fromPrice', { price: money(from) })}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="cf-qty">
        <label htmlFor="order-qty">{t('configure.quantity')}</label>
        <div className="cf-qty-controls">
          <button type="button" onClick={() => setQuantity(selection.quantity - 1)} aria-label={t('configure.decrease')}>
            −
          </button>
          <input
            id="order-qty"
            type="number"
            inputMode="numeric"
            min={1}
            max={product.maxQty}
            aria-describedby={priced ? 'order-qty-unit' : undefined}
            value={quantityText}
            onChange={(e) => {
              const text = e.target.value;
              setQuantityText(text);
              const parsed = Number(text);
              if (text.trim() !== '' && Number.isFinite(parsed)) {
                const next = clampQuantity(parsed);
                if (next !== selection.quantity) onSelect({ ...selection, quantity: next });
              }
            }}
            onBlur={() => setQuantityText(String(selection.quantity))}
          />
          <button type="button" onClick={() => setQuantity(selection.quantity + 1)} aria-label={t('configure.increase')}>
            +
          </button>
        </div>
        {priced && (
          <span className="cf-qty-unit" id="order-qty-unit">
            {money(priced.netCents / selection.quantity)} {unit}
          </span>
        )}
      </div>

      {groups.map((group) => {
        const { category, articles } = group;
        const label = categoryLabel(category, locale);
        const single = category.selectMode === 'single';
        const id = `order-cat-${category.key}`;

        // A required choice with a single article (Interior, Divide) is not a
        // choice: show the line and its price, no control. The category name
        // ("Construction", inherited from the booth sheets) would only puzzle
        // a panel buyer, so the base line stands on its own.
        if (single && category.required && articles.length === 1) {
          const article = articles[0];
          return (
            <div key={category.key} className="cf-cat cf-cat--fixed" id={id}>
              {article.priceType !== 'base' && <span className="cf-cat-title">{label}</span>}
              <div className="cf-fixed">
                <span className="cf-choice-label">{lineLabel(article, locale)}</span>
                <span className="cf-effect">{effectText(article)}</span>
              </div>
            </div>
          );
        }

        const layout = layoutFor(articles, locale);
        const noneChecked = !articles.some((a) => chosen.has(a.code));
        return (
          <fieldset key={category.key} className={`cf-cat cf-cat--${layout}`} id={id}>
            <legend>{label}</legend>
            {category.key === POWER_SOCKET_CATEGORY && <p className="cf-cat-hint">{t('configure.socketHint')}</p>}
            <div className="cf-choices">
              {single && !category.required && (
                <label className={`cf-choice${noneChecked ? ' active' : ''}`}>
                  <input type="radio" name={id} value="" checked={noneChecked} onChange={() => pick(group, null)} />
                  <span className="cf-choice-text">
                    <span className="cf-choice-label">{t('configure.none')}</span>
                  </span>
                </label>
              )}
              {articles.map((article) => {
                const checked = chosen.has(article.code);
                const hint = segmentsHint(article);
                return (
                  <label key={article.code} className={`cf-choice${checked ? ' active' : ''}`}>
                    {single ? (
                      <input type="radio" name={id} value={article.code} checked={checked} onChange={() => pick(group, article.code)} />
                    ) : (
                      <input
                        type="checkbox"
                        name={id}
                        value={article.code}
                        checked={checked}
                        onChange={(e) => toggle(article.code, e.target.checked)}
                      />
                    )}
                    <span className="cf-choice-text">
                      <span className="cf-choice-label">{lineLabel(article, locale)}</span>
                      <span className="cf-effect">{effectText(article)}</span>
                      {hint && <span className="cf-choice-hint">{hint}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <style jsx>{`
        .cf-models,
        .cf-cat {
          border: 0;
          margin: 0;
          padding: 0;
          min-width: 0;
        }
        .cf-models legend,
        .cf-cat legend,
        .cf-cat-title {
          display: block;
          font-size: 0.78rem;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #64748b;
          margin: 0 0 0.55rem;
          padding: 0;
        }
        .cf-models {
          margin-bottom: 1.2rem;
        }
        .cf-cat-hint {
          margin: -0.2rem 0 0.6rem;
          font-size: 0.82rem;
          color: #5a6b7f;
          line-height: 1.5;
        }
        .cf-model-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.7rem;
        }
        .cf-model {
          display: flex;
          gap: 0.7rem;
          align-items: flex-start;
          padding: 0.8rem 0.9rem;
          border: 1px solid #6b7d94;
          border-radius: 12px;
          cursor: pointer;
          color: var(--deep-blue, #0d3a5c);
        }
        .cf-model.active {
          border-color: var(--brand-blue, #197fc7);
          background: #e8f4fc;
        }
        .cf-model:focus-within {
          outline: 2px solid var(--brand-blue, #197fc7);
          outline-offset: 2px;
        }
        .cf-model input {
          margin-top: 0.2rem;
          accent-color: var(--brand-blue, #197fc7);
          flex-shrink: 0;
        }
        .cf-model-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }
        .cf-model-name {
          font-weight: 600;
          font-size: 0.98rem;
        }
        .cf-model-desc {
          font-size: 0.82rem;
          color: #5a6b7f;
          line-height: 1.5;
        }
        .cf-model-price {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--brand-blue-dark, #145f96);
        }
        .cf-qty {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          flex-wrap: wrap;
          padding-bottom: 1.1rem;
          border-bottom: 1px solid #eef2f6;
        }
        .cf-qty > label {
          font-weight: 600;
          color: var(--deep-blue, #0d3a5c);
          font-size: 0.95rem;
        }
        .cf-qty-controls {
          display: flex;
          align-items: center;
          border: 1px solid #6b7d94;
          border-radius: 10px;
          overflow: hidden;
        }
        .cf-qty-controls button {
          width: 44px;
          height: 44px;
          border: 0;
          background: #f8fafc;
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--deep-blue, #0d3a5c);
        }
        .cf-qty-controls button:hover {
          background: #e8f4fc;
        }
        .cf-qty-controls button:focus-visible,
        .cf-qty-controls input:focus-visible {
          outline: 2px solid var(--brand-blue, #197fc7);
          outline-offset: -2px;
        }
        .cf-qty-controls input {
          width: 64px;
          height: 44px;
          border: 0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          text-align: center;
          font-size: 1rem;
          font-weight: 600;
          color: var(--deep-blue, #0d3a5c);
        }
        .cf-qty-unit {
          font-size: 0.9rem;
          color: #5a6b7f;
        }
        .cf-cat {
          margin-top: 1.1rem;
        }
        .cf-choices {
          display: flex;
          flex-direction: column;
        }
        .cf-choice {
          display: flex;
          gap: 0.7rem;
          align-items: flex-start;
          cursor: pointer;
          color: var(--deep-blue, #0d3a5c);
          font-size: 0.93rem;
        }
        .cf-choice input {
          width: 18px;
          height: 18px;
          margin: 0.15rem 0 0;
          accent-color: var(--brand-blue, #197fc7);
          flex-shrink: 0;
        }
        .cf-choice input:focus-visible {
          outline: 2px solid var(--brand-blue, #197fc7);
          outline-offset: 2px;
        }
        .cf-choice-text {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 0.15rem 0.7rem;
          flex: 1;
          min-width: 0;
        }
        .cf-choice-label {
          font-weight: 500;
        }
        .cf-effect {
          color: var(--brand-blue-dark, #145f96);
          font-weight: 600;
          white-space: nowrap;
          margin-left: auto;
        }
        .cf-choice-hint {
          flex-basis: 100%;
          font-size: 0.82rem;
          color: #5a6b7f;
          line-height: 1.5;
        }
        /* rows: one article per line, price on the right */
        .cf-cat--rows .cf-choice {
          padding: 0.55rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .cf-cat--rows .cf-choice:last-child {
          border-bottom: 0;
        }
        /* chips: colours, door side, felt — 2 to 4 short labels side by side */
        .cf-cat--chips .cf-choices {
          flex-direction: row;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .cf-cat--chips .cf-choice {
          align-items: center;
          padding: 0.5rem 0.9rem;
          border: 1px solid #6b7d94;
          border-radius: 50px;
        }
        .cf-cat--chips .cf-choice input {
          margin: 0;
        }
        .cf-cat--chips .cf-choice-text {
          flex: initial;
          gap: 0.15rem 0.5rem;
        }
        .cf-cat--chips .cf-effect {
          margin-left: 0;
        }
        .cf-cat--chips .cf-choice.active {
          border-color: var(--brand-blue, #197fc7);
          background: #e8f4fc;
        }
        .cf-cat--chips .cf-choice.active .cf-choice-label {
          font-weight: 600;
        }
        .cf-fixed {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.55rem 0;
          color: var(--deep-blue, #0d3a5c);
          font-size: 0.93rem;
        }
        @media (max-width: 640px) {
          .cf-model-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
