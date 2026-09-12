'use client';

import { useId, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { ACOUSTIC_MATERIALS, ACOUSTIC_TARGETS } from '@/data/acoustic-materials';
import { Link } from '@/i18n/navigation';
import { localeFullCodes, type Locale } from '@/i18n/config';
import { BANDS, type CalculationResult, type CalculatorInput } from '@/lib/acoustics/calculate';

interface CalculatorProps {
  input: CalculatorInput;
  result: CalculationResult;
  onChange: (next: CalculatorInput) => void;
}

/** Intl locale for number formatting (en → en-BE, nl → nl-BE …). */
export function intlLocale(locale: string): string {
  return localeFullCodes[locale as Locale] ?? locale;
}

/**
 * The calculator island: three dimensions, three finishes and a room type
 * in, the Sabine result out — recomputed by the parent on every change, no
 * submit button. Labels come from the imported tables (`en`; `naam` for nl).
 */
export default function Calculator({ input, result, onChange }: CalculatorProps) {
  const t = useTranslations('calculator');
  const locale = useLocale();
  const headingId = useId();
  const resultsId = useId();

  const fmt = useMemo(() => {
    const tag = intlLocale(locale);
    const make = (digits: number) => new Intl.NumberFormat(tag, { minimumFractionDigits: 0, maximumFractionDigits: digits });
    const f0 = make(0), f1 = make(1), f2 = make(2);
    return { n0: (n: number) => f0.format(n), n1: (n: number) => f1.format(n), n2: (n: number) => f2.format(n) };
  }, [locale]);

  const materialLabel = (m: { naam: string; en: string }) => (locale === 'nl' ? m.naam : m.en);
  const materialOptions = ACOUSTIC_MATERIALS.map((m) => ({ value: String(m.nr), label: materialLabel(m) }));
  const targetOptions = ACOUSTIC_TARGETS.map((r) => ({
    value: r.naam,
    label: t('form.roomTypeOption', { name: materialLabel(r), t: fmt.n1(r.t) }),
  }));

  const set = (patch: Partial<CalculatorInput>) => onChange({ ...input, ...patch });
  const numeric = result.recommendations.filter((r) => r.m2 !== null);
  const unrated = result.recommendations.filter((r) => r.m2 === null);

  return (
    <section className="calc" aria-labelledby={headingId}>
      <div className="calc-form">
        <h2 id={headingId}>{t('form.title')}</h2>
        <div className="calc-dims">
          <Input
            name="length"
            label={t('form.length')}
            inputMode="decimal"
            autoComplete="off"
            value={input.length}
            onChange={(e) => set({ length: e.target.value })}
            helperText={t('form.unitHint')}
          />
          <Input
            name="width"
            label={t('form.width')}
            inputMode="decimal"
            autoComplete="off"
            value={input.width}
            onChange={(e) => set({ width: e.target.value })}
            helperText={t('form.unitHint')}
          />
          <Input
            name="height"
            label={t('form.height')}
            inputMode="decimal"
            autoComplete="off"
            value={input.height}
            onChange={(e) => set({ height: e.target.value })}
            helperText={t('form.unitHint')}
          />
        </div>
        <Select name="floor" label={t('form.floor')} options={materialOptions} value={String(input.floor)} onChange={(e) => set({ floor: Number(e.target.value) })} />
        <Select name="ceiling" label={t('form.ceiling')} options={materialOptions} value={String(input.ceiling)} onChange={(e) => set({ ceiling: Number(e.target.value) })} />
        <Select name="walls" label={t('form.walls')} options={materialOptions} value={String(input.walls)} onChange={(e) => set({ walls: Number(e.target.value) })} />
        <Select name="roomType" label={t('form.roomType')} options={targetOptions} value={input.roomType} onChange={(e) => set({ roomType: e.target.value })} />
      </div>

      <div className="calc-results" id={resultsId} role="region" aria-live="polite" aria-labelledby={`${resultsId}-title`}>
        <h2 id={`${resultsId}-title`}>{t('results.title')}</h2>

        {!result.valid ? (
          <p className="calc-empty">{t('results.empty')}</p>
        ) : (
          <>
            <dl className="calc-figures">
              <div>
                <dt>{t('results.volume')}</dt>
                <dd>{t('results.volumeValue', { v: fmt.n1(result.volume) })}</dd>
              </div>
              <div>
                <dt>{t('results.rtNow')}</dt>
                <dd>{t('results.seconds', { s: fmt.n2(result.rt60) })}</dd>
                <dd className="calc-hint">{t('results.rtNowHint')}</dd>
              </div>
              <div>
                <dt>{t('results.target', { room: materialLabel(result.target!) })}</dt>
                <dd>{t('results.seconds', { s: fmt.n2(result.target!.t) })}</dd>
                <dd className={`calc-status ${result.meetsTarget ? 'ok' : 'over'}`}>
                  {result.meetsTarget ? t('results.met') : t('results.notMet')}
                </dd>
              </div>
              <div>
                <dt>{t('results.toAdd')}</dt>
                <dd>{t('results.sabine', { a: fmt.n1(result.deltaA) })}</dd>
                <dd className="calc-hint">{t('results.toAddHint')}</dd>
              </div>
            </dl>

            <div className="calc-table-wrap">
              <table className="calc-table">
                <caption>{t('results.bandTable')}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t('results.band')}</th>
                    {BANDS.map((hz) => (
                      <th key={hz} scope="col">{fmt.n0(hz)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">{t('results.absorptionBand')}</th>
                    {result.absorption.map((a, i) => (
                      <td key={BANDS[i]}>{fmt.n1(a)}</td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">{t('results.rtBand')}</th>
                    {result.times.map((s, i) => (
                      <td key={BANDS[i]}>{fmt.n2(s)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {result.meetsTarget ? (
              <p className="calc-none">{t('results.noneNeeded')}</p>
            ) : (
              <div className="calc-reco">
                <h3>{t('results.recommendTitle')}</h3>
                <p className="calc-hint">{t('results.recommendIntro')}</p>
                <ul>
                  {numeric.map((r) => (
                    <li key={r.slug}>
                      <span>{t('results.productLine', { m2: fmt.n1(r.m2!), product: r.name, alphaW: r.alphaWSpec ?? '' })}</span>
                      <Link href={`/products/${r.slug}`} prefetch={false}>{t('results.productLink')}</Link>
                    </li>
                  ))}
                  {unrated.map((r) => (
                    <li key={r.slug} className="unrated">
                      <span>{t('results.productNoNumber', { product: r.name })}</span>
                      <Link href={`/products/${r.slug}`} prefetch={false}>{t('results.productLink')}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="calc-note">{t('results.evenNote')}</p>
          </>
        )}
      </div>

      <style jsx>{`
        .calc {
          display: grid;
          grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
          gap: 2rem;
          align-items: start;
        }

        .calc-form,
        .calc-results {
          background: white;
          border: 1px solid var(--sand);
          border-radius: var(--radius-lg);
          padding: 2rem;
        }

        .calc-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .calc h2 {
          font-size: 1.35rem;
          color: var(--deep-blue);
          margin: 0 0 0.5rem;
        }

        .calc h3 {
          font-size: 1.05rem;
          color: var(--deep-blue);
          margin: 0 0 0.25rem;
        }

        .calc-dims {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .calc-empty {
          color: #666;
          margin: 0;
        }

        .calc-figures {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          margin: 0 0 1.5rem;
        }

        .calc-figures > div {
          background: var(--cream);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
        }

        .calc-figures dt {
          font-size: 0.85rem;
          color: #666;
          margin: 0 0 0.25rem;
        }

        .calc-figures dd {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--deep-blue);
          margin: 0;
        }

        .calc-hint {
          font-size: 0.85rem;
          color: #767676;
          margin: 0.25rem 0 0;
        }

        .calc-status {
          display: inline-block;
          margin: 0.5rem 0 0;
          padding: 0.2rem 0.7rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .calc-status.ok {
          background: #e6f7f0;
          color: #059669;
        }

        .calc-status.over {
          background: #fef2f2;
          color: #dc2626;
        }

        .calc-table-wrap {
          overflow-x: auto;
          margin: 0 0 1.5rem;
        }

        .calc-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .calc-table caption {
          text-align: left;
          font-size: 0.85rem;
          color: #666;
          padding: 0 0 0.5rem;
        }

        .calc-table th,
        .calc-table td {
          padding: 0.5rem 0.6rem;
          border-bottom: 1px solid var(--sand);
          text-align: right;
          white-space: nowrap;
        }

        .calc-table th[scope='row'],
        .calc-table th:first-child {
          text-align: left;
          font-weight: 500;
        }

        .calc-table thead th {
          color: var(--deep-blue);
        }

        .calc-reco ul {
          list-style: none;
          margin: 0.75rem 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .calc-reco li {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          padding: 0.6rem 0.9rem;
          background: var(--brand-blue-pale);
          border-radius: var(--radius-sm);
        }

        .calc-reco li.unrated {
          background: var(--cream);
          color: #555;
        }

        .calc-reco li :global(a) {
          color: var(--brand-blue);
          text-decoration: underline;
          white-space: nowrap;
          font-size: 0.9rem;
        }

        .calc-none {
          background: #e6f7f0;
          color: #059669;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          margin: 0;
        }

        .calc-note {
          font-size: 0.85rem;
          color: #666;
          margin: 1.5rem 0 0;
        }

        @media (max-width: 992px) {
          .calc {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 576px) {
          .calc-form,
          .calc-results {
            padding: 1.25rem;
          }

          .calc-dims,
          .calc-figures {
            grid-template-columns: 1fr;
          }

          .calc-reco li {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </section>
  );
}
