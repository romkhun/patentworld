/**
 * Reusable JSON-LD structured data component.
 * Renders a <script type="application/ld+json"> tag with the provided data.
 *
 * Accepts a single schema object or an array of schema objects.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
