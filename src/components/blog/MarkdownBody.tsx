import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownBodyProps {
  markdown: string;
  className?: string;
}

/**
 * Renders an editorial markdown body (GFM: tables, bold, links, H2/H3).
 * Internal links in the workbook already carry the locale prefix
 * (/nl/products/…), so they are rendered as plain anchors; external links
 * open in a new tab.
 */
export default function MarkdownBody({ markdown, className = 'prose' }: MarkdownBodyProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const external = /^https?:\/\//.test(href ?? '');
            return (
              <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="prose-table-wrap">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
