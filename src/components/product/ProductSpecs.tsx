import { getTranslations } from 'next-intl/server';

import type { SpecTableDef } from '@/data/specs/types';
import { resolveMsg } from './resolveMsg';

interface ProductSpecsProps {
  /** Declarative table definition, see src/data/specs/<slug>.ts */
  cards: SpecTableDef;
  /** Section eyebrow, e.g. "TECHNICAL" */
  tag: string;
  /** Section heading, e.g. "Specifications" */
  title: string;
  /** Optional lead paragraph under the heading */
  intro?: string;
  /** How many cards start expanded (the rest are collapsed accordions) */
  openCount?: number;
}

/**
 * Specifications — server component.
 *
 * Renders one native <details> accordion per spec card. Nothing here needs
 * JavaScript: the browser handles open/close, the content is in the HTML
 * for crawlers, and the whole block is excluded from the client bundle.
 */
export default async function ProductSpecs({
  cards,
  tag,
  title,
  intro,
  openCount = 2,
}: ProductSpecsProps) {
  const t = await getTranslations();

  return (
    <section id="specs" className="ps-section ps-specs">
      <div className="ps-header">
        <span className="section-tag">{tag}</span>
        <h2>{title}</h2>
        {intro && <p>{intro}</p>}
      </div>

      <div className="ps-specs-grid">
        {cards.map((card, i) => {
          const heading = resolveMsg(t, card.title);
          return (
            <details key={heading} className="ps-card ps-accordion" open={i < openCount}>
              <summary>
                <h3>{heading}</h3>
                <span className="ps-chevron" aria-hidden="true" />
              </summary>
              <table className="ps-table">
                <tbody>
                  {card.rows.map((row, j) => (
                    <tr key={j}>
                      <th scope="row">{resolveMsg(t, row.label)}</th>
                      <td>{resolveMsg(t, row.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          );
        })}
      </div>
    </section>
  );
}
