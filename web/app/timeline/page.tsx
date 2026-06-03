import TimelineView from "@/components/TimelineView";
import { getTimeline, generatedMtime } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Timeline",
  description:
    "Chronological record (2023–2026) of the Bricks & Minifigs (BAM) – Reckless Ben dispute: consignment, repossession, arrests, the search warrant, and the Utah lawsuit — each entry labeled Confirmed or Allegation.",
  path: "/timeline",
};
export const metadata = pageMetadata(META);

export default function TimelinePage() {
  const data = getTimeline();
  return (
    <div>
      <PageStructuredData {...META} dateModified={generatedMtime("data/timeline.json").toISOString()} />
      <h1 className="page-title">Timeline</h1>
      <p className="page-intro">
        Chronological record, 2023–2026. Filter by status or search. Each entry
        is labeled as documented (<b>Confirmed</b>), a contested contention
        (<b>Allegation</b>), or otherwise <b>Reported</b>.
      </p>
      <TimelineView data={data} />
    </div>
  );
}
