import type { FaqEntry } from '@/lib/structured-data';

interface ProductFaqProps {
  entries: FaqEntry[];
  tag: string;
  title: string;
}

/**
 * FAQ — server component with native <details> accordions.
 *
 * The same entries feed the FAQPage JSON-LD on the route page, so the
 * structured data now matches visible content (Google requires FAQ rich
 * results to reflect Q&A that is actually on the page).
 */
export default function ProductFaq({ entries, tag, title }: ProductFaqProps) {
  if (entries.length === 0) return null;

  return (
    <section id="faq" className="ps-section ps-faq">
      <div className="ps-header">
        <span className="section-tag">{tag}</span>
        <h2>{title}</h2>
      </div>

      <div className="ps-faq-list">
        {entries.map((entry, i) => (
          <details key={i} className="ps-accordion ps-faq-item" open={i === 0}>
            <summary>
              <h3>{entry.question}</h3>
              <span className="ps-chevron" aria-hidden="true" />
            </summary>
            <p>{entry.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
