'use client';

// CLIENT PORTAL — interactive pricelist.
// Category tabs (sticky), live search, optional market filter (only when the
// account sees more than one price group), EUR/PLN currency switch, print
// stylesheet and CSV export. Every category stays mounted in the DOM —
// inactive ones are hidden on screen and ALL of them print.
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Printer, Search } from 'lucide-react';
import type { PricebookMeta, PriceRow } from '@/lib/portal/types';
import { categoryRank } from '@/lib/portal/types';

type Currency = 'EUR' | 'PLN';

type Props = {
  rows: PriceRow[];
  meta: PricebookMeta;
  formatLocale: string;
  defaultCurrency: Currency;
};

export default function PricelistView({ rows, meta, formatLocale, defaultCurrency }: Props) {
  const t = useTranslations('portal.pricelist');

  const markets = useMemo(
    () => Array.from(new Set(rows.map((r) => r.market))).sort(),
    [rows],
  );
  const hasPln = useMemo(() => rows.some((r) => r.price_pln !== null), [rows]);

  const [query, setQuery] = useState('');
  const [market, setMarket] = useState<string>('all');
  const [currency, setCurrency] = useState<Currency>(
    defaultCurrency === 'PLN' && hasPln ? 'PLN' : 'EUR',
  );
  const [active, setActive] = useState<string | null>(null);

  // --- Filtering -------------------------------------------------------------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (market !== 'all' && r.market !== market) return false;
      if (!q) return true;
      return (
        r.product.toLowerCase().includes(q) ||
        (r.code ?? '').toLowerCase().includes(q) ||
        (r.product_group ?? '').toLowerCase().includes(q)
      );
    });
  }, [rows, query, market]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filtered) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => categoryRank(a[0]) - categoryRank(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [filtered]);

  const activeCategory =
    active && categories.some((c) => c.name === active) ? active : categories[0]?.name ?? null;

  const showMarketChip = market === 'all' && markets.length > 1;

  // --- Formatting ------------------------------------------------------------
  const fmtEur = useMemo(
    () => new Intl.NumberFormat(formatLocale, { style: 'currency', currency: 'EUR' }),
    [formatLocale],
  );
  const fmtPln = useMemo(
    () => new Intl.NumberFormat(formatLocale, { style: 'currency', currency: 'PLN' }),
    [formatLocale],
  );
  const price = (r: PriceRow) =>
    currency === 'PLN' ? (r.price_pln === null ? '—' : fmtPln.format(r.price_pln)) : fmtEur.format(r.price_eur);

  // --- CSV export (respects current filter) -----------------------------------
  function exportCsv() {
    const esc = (v: string | number | null) =>
      v === null || v === undefined ? '' : `"${String(v).replace(/"/g, '""')}"`;
    const lines = [
      ['Category', 'Code', 'Product', 'Unit', 'Market', 'Price EUR', 'Price PLN'].join(';'),
      ...filtered.map((r) =>
        [
          esc(r.category),
          esc(r.code),
          esc(r.product),
          esc(r.unit),
          esc(r.market),
          r.price_eur.toFixed(2).replace('.', ','),
          r.price_pln === null ? '' : r.price_pln.toFixed(2).replace('.', ','),
        ].join(';'),
      ),
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `STRETCH-pricelist-${meta.version}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // --- Grouping inside a category ---------------------------------------------
  function groupsFor(category: string) {
    const inCat = filtered.filter((r) => r.category === category);
    const map = new Map<string, PriceRow[]>();
    for (const r of inCat) {
      const key = r.product_group ?? '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }

  return (
    <div className="plv">
      {/* Meta strip */}
      <div className="plv__meta print-show">
        <div className="container plv__meta-in">
          <h1 className="plv__title">{t('title')}</h1>
          <div className="plv__meta-facts">
            <span>
              {t('version')} <strong>{meta.version}</strong>
            </span>
            {meta.updated_at && (
              <span>
                {t('updated')} <strong>{String(meta.updated_at).slice(0, 10)}</strong>
              </span>
            )}
            {currency === 'PLN' && meta.fx_eur_pln && (
              <span>
                FX <strong>1 EUR = {meta.fx_eur_pln} PLN</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="plv__toolbar no-print">
        <div className="container plv__toolbar-in">
          <label className="plv__search">
            <Search size={15} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              aria-label={t('search')}
            />
          </label>

          {markets.length > 1 && (
            <select
              className="plv__select"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              aria-label={t('market')}
            >
              <option value="all">{t('allMarketsOpt')}</option>
              {markets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}

          {hasPln && (
            <div className="plv__currency" role="group" aria-label={t('currency')}>
              {(['EUR', 'PLN'] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={currency === c ? 'on' : ''}
                  onClick={() => setCurrency(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <span className="plv__count">{t('count', { count: filtered.length })}</span>
          <span className="plv__spacer" />
          <button type="button" className="plv__tool" onClick={() => window.print()}>
            <Printer size={14} /> {t('print')}
          </button>
          <button type="button" className="plv__tool" onClick={exportCsv}>
            <Download size={14} /> {t('exportCsv')}
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <nav className="plv__tabs no-print" aria-label={t('title')}>
        <div className="container plv__tabs-in" role="tablist">
          {categories.map((c) => (
            <button
              key={c.name}
              type="button"
              role="tab"
              aria-selected={c.name === activeCategory}
              className={c.name === activeCategory ? 'plv__tab plv__tab--on' : 'plv__tab'}
              onClick={() => setActive(c.name)}
            >
              {c.name}
              <small>{c.count}</small>
            </button>
          ))}
        </div>
      </nav>

      {/* Content — every category rendered; inactive hidden on screen, all print */}
      <main className="container plv__main">
        {filtered.length === 0 && <p className="plv__empty">{t('empty')}</p>}

        {categories.map((c) => (
          <section
            key={c.name}
            className={c.name === activeCategory ? 'plv__cat plv__cat--on' : 'plv__cat'}
          >
            <h2 className="plv__cat-title print-show">{c.name}</h2>
            {groupsFor(c.name).map(([group, groupRows]) => (
              <article key={group || 'default'} className="plv__card">
                <h3>
                  <span>{group || c.name}</span>
                  <small>{groupRows.length}</small>
                </h3>
                <div>
                  {groupRows.map((r) => (
                    <div key={`${r.product}|${r.market}|${r.sort}`} className="plv__row">
                      <div className="plv__prod">
                        <span className="plv__name">{r.product}</span>
                        {r.code && <span className="plv__code">{r.code}</span>}
                      </div>
                      {showMarketChip && <span className="plv__chip plv__chip--mkt">{r.market}</span>}
                      {r.unit && <span className="plv__chip">{r.unit}</span>}
                      <span className="plv__price">{price(r)}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        ))}
      </main>

      <style jsx>{`
        .plv {
          padding-bottom: 64px;
        }
        .plv__meta {
          background: #fff;
          border-bottom: 3px solid var(--red);
        }
        .plv__meta-in {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          padding-top: 22px;
          padding-bottom: 16px;
        }
        .plv__title {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 900;
          text-transform: uppercase;
          font-size: clamp(24px, 3vw, 38px);
          letter-spacing: 0.01em;
        }
        .plv__meta-facts {
          display: flex;
          gap: 22px;
          flex-wrap: wrap;
          color: var(--text-muted-2);
          font-size: 12.5px;
        }
        .plv__meta-facts strong {
          color: var(--text);
        }

        .plv__toolbar {
          background: #fff;
          border-bottom: 1px solid var(--border);
        }
        .plv__toolbar-in {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding-top: 12px;
          padding-bottom: 12px;
        }
        .plv__search {
          flex: 1 1 240px;
          max-width: 420px;
          display: flex;
          align-items: center;
          gap: 9px;
          border: 1px solid var(--border-input);
          padding: 0 12px;
          background: #fff;
          color: var(--text-faint);
        }
        .plv__search input {
          border: 0;
          outline: none;
          padding: 11px 0;
          width: 100%;
          font: inherit;
          font-size: 14px;
          background: transparent;
          color: var(--text);
        }
        .plv__select {
          border: 1px solid var(--border-input);
          background: #fff;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 10px;
          max-width: 210px;
        }
        .plv__currency {
          display: inline-flex;
          border: 1px solid var(--border-input);
        }
        .plv__currency button {
          border: 0;
          background: #fff;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 10px 14px;
          cursor: pointer;
          color: var(--text-muted-2);
        }
        .plv__currency button.on {
          background: var(--black);
          color: #fff;
        }
        .plv__count {
          font-size: 12.5px;
          color: var(--text-muted-2);
          white-space: nowrap;
        }
        .plv__spacer {
          flex: 1;
        }
        .plv__tool {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border-input);
          background: #fff;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 10px 14px;
          cursor: pointer;
        }
        .plv__tool:hover {
          border-color: var(--black);
        }

        .plv__tabs {
          position: sticky;
          top: calc(var(--header-h) + 42px);
          z-index: 30;
          background: #fff;
          border-bottom: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .plv__tabs-in {
          display: flex;
          gap: 2px;
          overflow-x: auto;
        }
        .plv__tab {
          border: 0;
          background: none;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 13px 14px 11px;
          cursor: pointer;
          white-space: nowrap;
          border-bottom: 3px solid transparent;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .plv__tab small {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-faint-2);
          background: var(--surface);
          border: 1px solid var(--border-2);
          padding: 2px 6px;
        }
        .plv__tab:hover {
          color: var(--text);
        }
        .plv__tab--on {
          color: var(--text);
          border-bottom-color: var(--red);
        }
        .plv__tab--on small {
          background: var(--red);
          border-color: var(--red);
          color: #fff;
        }

        .plv__main {
          padding-top: 26px;
        }
        .plv__empty {
          color: var(--text-muted);
          font-size: 14.5px;
          padding: 40px 0;
        }
        .plv__cat {
          display: none;
        }
        .plv__cat--on {
          display: block;
        }
        .plv__cat-title {
          display: none;
        }

        .plv__card {
          background: #fff;
          border: 1px solid var(--border);
          margin: 0 0 18px;
        }
        .plv__card h3 {
          margin: 0;
          background: var(--black);
          color: #fff;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 11px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .plv__card h3 small {
          color: var(--on-dark-muted);
          font-weight: 600;
          font-size: 11px;
        }
        .plv__row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 9px 16px;
          border-top: 1px solid #f0efec;
          font-size: 14px;
        }
        .plv__row:nth-child(even) {
          background: #fafaf8;
        }
        .plv__prod {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }
        .plv__name {
          font-weight: 600;
        }
        .plv__code {
          font-size: 11.5px;
          color: var(--text-faint);
          letter-spacing: 0.04em;
        }
        .plv__chip {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-muted-2);
          border: 1px solid var(--border-2);
          background: var(--surface);
          padding: 3px 8px;
          white-space: nowrap;
        }
        .plv__chip--mkt {
          background: #fff;
          border-color: var(--border-input);
        }
        .plv__price {
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          min-width: 96px;
          text-align: right;
        }

        @media (max-width: 640px) {
          .plv__row {
            flex-wrap: wrap;
            row-gap: 4px;
          }
          .plv__price {
            min-width: 0;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .plv__cat {
            display: block !important;
            break-inside: auto;
          }
          .plv__cat-title {
            display: block;
            font-size: 16px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 22px 0 10px;
          }
          .plv__card {
            border-color: #ddd;
          }
          .plv__card h3 {
            background: #111 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .plv__row {
            padding: 5px 10px;
            font-size: 11.5px;
          }
          .plv__price {
            font-size: 11.5px;
          }
        }
      `}</style>
    </div>
  );
}
