import Link from "next/link";
import SectionedTable from "@/components/SectionedTable";
import { getMediaNews, getMediaPrimary, generatedMtime } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Media Catalog",
  description:
    "Cataloged (not re-hosted) news articles, videos, and statements covering the Bricks & Minifigs (BAM) – Reckless Ben controversy, with links to original sources.",
  path: "/media",
};
export const metadata = pageMetadata(META);

export default function MediaPage() {
  const news = getMediaNews();
  const primary = getMediaPrimary();
  return (
    <div>
      <PageStructuredData {...META} dateModified={generatedMtime("data/media-news.json").toISOString()} />
      <h1 className="page-title">Media catalog</h1>
      <p className="page-intro">
        Links are cataloged, <b>not re-hosted</b> (copyright). Verify channel
        ownership and bylines at the source before relying on any item. To fetch
        local copies, see the{" "}
        <Link href="/lawsuit/documents">download guidance</Link>.
      </p>

      <h2 style={{ marginTop: 28 }}>News &amp; commentary</h2>
      <SectionedTable data={news} searchPlaceholder="Search articles…" />

      <h2 id="primary" style={{ marginTop: 40 }}>
        Primary sources (videos &amp; statements)
      </h2>
      <SectionedTable data={primary} searchPlaceholder="Search primary sources…" />
    </div>
  );
}
