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
      // JSON.stringify already escapes "<" inside strings as needed; this is the
      // standard pattern recommended by Next.js for JSON-LD injection.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
