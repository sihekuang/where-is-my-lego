import TimelineView from "@/components/TimelineView";
import { getTimeline, generatedMtime } from "@/lib/content";
import { getDict } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Timeline",
  description:
    "Chronological record (2023–2026) of the Bricks & Minifigs (BAM) – Reckless Ben dispute: consignment, repossession, arrests, the search warrant, and the Utah lawsuit — each entry labeled Confirmed or Allegation.",
  path: "/timeline",
};
export const metadata = pageMetadata(META);

export default async function TimelinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const data = getTimeline(locale);
  return (
    <div>
      <PageStructuredData {...META} dateModified={generatedMtime("data/timeline.json").toISOString()} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{t("nav.timeline")}</h1>
      <p className="mt-2 max-w-[70ch] text-muted-foreground">
        Chronological record, 2023–2026. Filter by status or search. Each entry
        is labeled as documented (<b>Confirmed</b>), a contested contention
        (<b>Allegation</b>), or otherwise <b>Reported</b>.
      </p>
      <TimelineView data={data} />
    </div>
  );
}
