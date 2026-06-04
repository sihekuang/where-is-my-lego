import SectionedTable from "@/components/SectionedTable";
import RelationshipGraph from "@/components/RelationshipGraph";
import { getParties, getRelationships, generatedMtime } from "@/lib/content";
import { withRosterAnchors } from "@/lib/roster-anchors";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Parties",
  description:
    "The people and entities in the Bricks & Minifigs (BAM) – Reckless Ben dispute, described only by their public roles and publicly reported statements.",
  path: "/parties",
};
export const metadata = pageMetadata(META);

export default function PartiesPage() {
  const graph = getRelationships();
  const { sections, rosterIds } = withRosterAnchors(getParties(), graph.nodes);
  return (
    <div>
      <PageStructuredData {...META} dateModified={generatedMtime("data/parties.json").toISOString()} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Parties</h1>
      <p className="mt-2 max-w-[70ch] text-muted-foreground">
        Each person and entity is described <b>only by their public role</b> in
        the dispute and their publicly reported statements. No private personal
        information is included.
      </p>

      <RelationshipGraph data={graph} rosterIds={rosterIds} />

      <div id="roster">
        <SectionedTable data={{ sections }} searchPlaceholder="Search parties…" />
      </div>
    </div>
  );
}
