export interface FaqEntryLike {
  question: string;
  answer: string;
}

interface FaqListProps {
  entries: FaqEntryLike[];
  /** Open the first n items by default */
  openCount?: number;
}

/**
 * Native accordion list (details/summary, no client JS) shared by the FAQ
 * page, the range hubs, the booth price guide and the product pages. The
 * matching FAQPage JSON-LD is emitted once per page by the caller.
 */
export default function FaqList({ entries, openCount = 0 }: FaqListProps) {
  if (entries.length === 0) return null;
  return (
    <ul className="faq-list">
      {entries.map((e, i) => (
        <li key={e.question}>
          <details open={i < openCount}>
            <summary>{e.question}</summary>
            <p>{e.answer}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}
