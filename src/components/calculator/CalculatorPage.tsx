'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import FaqList from '@/components/faq/FaqList';
import { ACOUSTIC_MATERIALS, ACOUSTIC_TARGETS } from '@/data/acoustic-materials';
import { calculate, type CalculatorInput } from '@/lib/acoustics/calculate';

import Calculator, { intlLocale } from './Calculator';
import CalculatorLeadForm from './CalculatorLeadForm';

/** The FAQ keys, in page order (calculator.faq.<key>.question / .answer). */
import { CALCULATOR_FAQ_KEYS } from './faqKeys';

/**
 * Starting point of the form: a 5 × 4 × 2.8 m room with hard finishes
 * (concrete floor, plasterboard ceiling, plaster walls) as an office — the
 * worked example of src/lib/acoustics/sabine.check.mjs. The rows are looked
 * up by their English label so a renumbering of the table cannot silently
 * change the default.
 */
function defaultInput(): CalculatorInput {
  const nr = (en: string) => ACOUSTIC_MATERIALS.find((m) => m.en === en)?.nr ?? ACOUSTIC_MATERIALS[0].nr;
  return {
    length: '5',
    width: '4',
    height: '2.8',
    floor: nr('Concrete'),
    ceiling: nr('Plasterboard'),
    walls: nr('Plaster'),
    roomType: ACOUSTIC_TARGETS.find((t) => t.en === 'Office')?.naam ?? ACOUSTIC_TARGETS[0].naam,
  };
}

/**
 * Everything below the hero: explanation of Sabine and of the targets, the
 * calculator island, the FAQ and, last, the lead form — which needs the
 * calculation, so the state lives here.
 */
export default function CalculatorPage() {
  const t = useTranslations('calculator');
  const locale = useLocale();
  const [input, setInput] = useState<CalculatorInput>(defaultInput);
  const result = useMemo(() => calculate(input), [input]);
  const n1 = useMemo(() => new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 1 }), [locale]);
  const label = (row: { naam: string; en: string }) => (locale === 'nl' ? row.naam : row.en);

  const faq = CALCULATOR_FAQ_KEYS.map((key) => ({ question: t(`faq.${key}.question`), answer: t(`faq.${key}.answer`) }));

  return (
    <div className="calc-page">
      <section className="calc-intro" aria-labelledby="calc-intro-title">
        <div className="calc-intro-text">
          <span className="section-tag">{t('intro.tag')}</span>
          <h2 id="calc-intro-title">{t('intro.title')}</h2>
          <p>{t('intro.sabine')}</p>
          <p>{t('intro.headline')}</p>
          <p>{t('intro.targets')}</p>
          <p className="calc-intro-note">{t('intro.note')}</p>
        </div>
        <div className="calc-targets-wrap">
          <table className="calc-targets">
            <caption>{t('intro.targetsTableCaption')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('intro.roomType')}</th>
                <th scope="col">{t('intro.targetRt')}</th>
              </tr>
            </thead>
            <tbody>
              {ACOUSTIC_TARGETS.map((row) => (
                <tr key={row.naam}>
                  <td>{label(row)}</td>
                  <td>{t('results.seconds', { s: n1.format(row.t) })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="calc-tool">
        <Calculator input={input} result={result} onChange={setInput} />
      </section>

      <section className="calc-faq" aria-labelledby="calc-faq-title">
        <span className="section-tag">{t('faq.tag')}</span>
        <h2 id="calc-faq-title">{t('faq.title')}</h2>
        <FaqList entries={faq} />
      </section>

      <section className="calc-lead-section" aria-labelledby="calc-lead-title">
        <div className="calc-lead-inner">
          <span className="section-tag">{t('lead.tag')}</span>
          <h2 id="calc-lead-title">{t('lead.title')}</h2>
          <p>{t('lead.subtitle')}</p>
          <CalculatorLeadForm result={result} />
        </div>
      </section>

      <style jsx>{`
        .calc-page {
          background: var(--cream);
        }

        .calc-page section {
          padding: 3rem 4rem;
        }

        .calc-page h2 {
          font-size: 2rem;
          color: var(--deep-blue);
          letter-spacing: -0.5px;
          margin: 0 0 1rem;
        }

        .calc-intro {
          display: grid;
          grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
          gap: 3rem;
          max-width: 1200px;
          margin: 0 auto;
          align-items: start;
        }

        .calc-intro-text p {
          color: #444;
          line-height: 1.7;
          margin: 0 0 1rem;
        }

        .calc-intro-note {
          font-size: 0.95rem;
          color: #666;
        }

        .calc-targets-wrap {
          overflow-x: auto;
          background: white;
          border: 1px solid var(--sand);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
        }

        .calc-targets {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .calc-targets caption {
          text-align: left;
          font-weight: 600;
          color: var(--deep-blue);
          padding: 0 0 0.75rem;
        }

        .calc-targets th,
        .calc-targets td {
          padding: 0.4rem 0.5rem;
          border-bottom: 1px solid #eef2f5;
          text-align: left;
        }

        .calc-targets th:last-child,
        .calc-targets td:last-child {
          text-align: right;
          white-space: nowrap;
        }

        .calc-tool {
          max-width: 1200px;
          margin: 0 auto;
        }

        .calc-faq {
          max-width: 900px;
          margin: 0 auto;
        }

        .calc-lead-section {
          background: white;
        }

        .calc-lead-inner {
          max-width: 760px;
          margin: 0 auto;
        }

        .calc-lead-inner > p {
          color: #666;
          line-height: 1.7;
          margin: 0 0 2rem;
        }

        @media (max-width: 992px) {
          .calc-page section {
            padding: 2.5rem 1.5rem;
          }

          .calc-intro {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .calc-page h2 {
            font-size: 1.6rem;
          }
        }

        @media (max-width: 576px) {
          .calc-page section {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
