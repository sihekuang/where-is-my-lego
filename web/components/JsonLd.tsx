import { pageJsonLd } from "@/lib/structured-data";

/** Renders a JSON-LD <script>. data is trusted (built server-side from our own strings). */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

type Props = { title: string; description: string; path: string; dateModified?: string };
export function PageStructuredData(props: Props) {
  return <JsonLd data={pageJsonLd(props)} />;
}
