/**
 * Renders a JSON-LD payload as a single `<script type="application/ld+json">` tag.
 *
 * Use one component per schema object — search engines and AI crawlers tolerate
 * multiple JSON-LD blocks on the same page just fine, and keeping them
 * separated (Product / BreadcrumbList / Organization) makes them easier to
 * validate and debug in tools like https://validator.schema.org/.
 */

interface JsonLdProps {
  data: object | object[];
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify does NOT escape "<", so a string containing
      // "</script>" would break out of the tag. Escape it to < —
      // still valid JSON, inert in HTML.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
