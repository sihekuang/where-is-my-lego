import TimelineView from "@/components/TimelineView";
import { getTimeline } from "@/lib/content";

export const metadata = { title: "Timeline — BAM × Reckless Ben" };

export default function TimelinePage() {
  const data = getTimeline();
  return (
    <div>
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
