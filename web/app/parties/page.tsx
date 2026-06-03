import SectionedTable from "@/components/SectionedTable";
import RelationshipGraph from "@/components/RelationshipGraph";
import { getParties, getRelationships, generatedMtime } from "@/lib/content";
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
  const data = getParties();
  const graph = getRelationships();
  return (
    <div>
      <PageStructuredData {...META} dateModified={generatedMtime("data/parties.json").toISOString()} />
      <h1 className="page-title">Parties</h1>
      <p className="page-intro">
        Each person and entity is described <b>only by their public role</b> in
        the dispute and their publicly reported statements. No private personal
        information is included.
      </p>

      <RelationshipGraph data={graph} />

      <div id="roster">
        <SectionedTable data={data} searchPlaceholder="Search parties…" />
      </div>
    </div>
  );
}
