import Link from "next/link";
import SectionedTable from "@/components/SectionedTable";
import { getMediaNews, getMediaPrimary, generatedMtime } from "@/lib/content";
import { getDict } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Media Catalog",
  description:
    "Cataloged (not re-hosted) news articles, videos, and statements covering the Bricks & Minifigs (BAM) – Reckless Ben controversy, with links to original sources.",
  path: "/media",
};
export const metadata = pageMetadata(META);

export default async function MediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const news = getMediaNews(locale);
  const primary = getMediaPrimary(locale);
  return (
    <div>
      <PageStructuredData {...META} dateModified={generatedMtime("data/media-news.json").toISOString()} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{t("nav.media")}</h1>
      <p className="mt-2 max-w-[70ch] text-muted-foreground">
        Links are cataloged, <b>not re-hosted</b> (copyright). Verify channel
        ownership and bylines at the source before relying on any item. To fetch
        local copies, see the{" "}
        <Link href={`/${locale}/lawsuit/documents`} className="text-primary hover:underline">download guidance</Link>.
      </p>

      <h2 className="mt-7 text-xl">News &amp; commentary</h2>
      <SectionedTable data={news} searchPlaceholder="Search articles…" />

      <h2 id="primary" className="mt-10 text-xl">
        Primary sources (videos &amp; statements)
      </h2>
      <SectionedTable data={primary} searchPlaceholder="Search primary sources…" />
    </div>
  );
}
