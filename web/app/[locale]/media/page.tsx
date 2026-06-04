import type { Metadata } from "next";
import Link from "next/link";
import SectionedTable from "@/components/SectionedTable";
import { getMediaNews, getMediaPrimary, generatedMtime } from "@/lib/content";
import { getDict, getDictObject } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";
import { Rich } from "@/components/Rich";

const META = {
  title: "Media Catalog",
  description:
    "Cataloged (not re-hosted) news articles, videos, and statements covering the Bricks & Minifigs (BAM) – Reckless Ben controversy, with links to original sources.",
  path: "/media",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(META, locale);
}

export default async function MediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const labels = getDictObject(locale);
  const news = getMediaNews(locale);
  const primary = getMediaPrimary(locale);
  return (
    <div>
      <PageStructuredData {...META} locale={locale} dateModified={generatedMtime("data/media-news.json").toISOString()} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{t("nav.media")}</h1>
      <p className="mt-2 max-w-[70ch] text-muted-foreground">
        <Rich
          text={t("media.intro")}
          tokens={{
            download: (
              <Link href={`/${locale}/lawsuit/documents`} className="text-primary hover:underline">
                {t("media.downloadGuidance")}
              </Link>
            ),
          }}
        />
      </p>

      <h2 className="mt-7 text-xl">{t("media.news")}</h2>
      <SectionedTable data={news} labels={labels} searchPlaceholder={t("media.search")} />

      <h2 id="primary" className="mt-10 text-xl">
        {t("media.primary")}
      </h2>
      <SectionedTable data={primary} labels={labels} searchPlaceholder={t("media.searchPrimary")} />
    </div>
  );
}
