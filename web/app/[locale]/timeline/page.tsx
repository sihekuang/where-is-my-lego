import type { Metadata } from "next";
import TimelineView from "@/components/TimelineView";
import { getTimeline, generatedMtime } from "@/lib/content";
import { getDict, getDictObject } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";
import { Rich } from "@/components/Rich";

const META = {
  title: "Timeline",
  description:
    "Chronological record (2023–2026) of the Bricks & Minifigs (BAM) – Reckless Ben dispute: consignment, repossession, arrests, the search warrant, and the Utah lawsuit — each entry labeled Confirmed or Allegation.",
  path: "/timeline",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(META, locale);
}

export default async function TimelinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const data = getTimeline(locale);
  return (
    <div>
      <PageStructuredData {...META} locale={locale} dateModified={generatedMtime("data/timeline.json").toISOString()} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{t("nav.timeline")}</h1>
      <p className="mt-2 max-w-[70ch] text-muted-foreground">
        <Rich text={t("timeline.intro")} />
      </p>
      <TimelineView data={data} labels={getDictObject(locale)} />
    </div>
  );
}
