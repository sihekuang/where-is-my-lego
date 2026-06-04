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
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Media catalog</h1>
      <p className="mt-2 max-w-[70ch] text-muted-foreground">
        Links are cataloged, <b>not re-hosted</b> (copyright). Verify channel
        ownership and bylines at the source before relying on any item. To fetch
        local copies, see the{" "}
        <Link href="/lawsuit/documents" className="text-primary hover:underline">download guidance</Link>.
      </p>

      <div className="mt-4 rounded-md border border-border bg-muted px-3.5 py-2.5 text-[13px] text-muted-foreground">
        Looking for <b className="text-foreground">primary records</b> — court filings, public
        records, official statements, and the full video index? See the{" "}
        <Link href="/media/community-sources" className="text-primary hover:underline">
          community-curated sources
        </Link>{" "}
        compiled from the r/RecklessBen megathreads (defense-aligned; verify before relying).
      </div>

      <h2 className="mt-7 text-xl">News &amp; commentary</h2>
      <SectionedTable data={news} searchPlaceholder="Search articles…" />

      <h2 id="primary" className="mt-10 text-xl">
        Primary sources (videos &amp; statements)
      </h2>
      <SectionedTable data={primary} searchPlaceholder="Search primary sources…" />
    </div>
  );
}
