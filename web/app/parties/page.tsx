import SectionedTable from "@/components/SectionedTable";
import { getParties } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const META = {
  title: "Parties",
  description:
    "The people and entities in the Bricks & Minifigs (BAM) – Reckless Ben dispute, described only by their public roles and publicly reported statements.",
  path: "/parties",
};
export const metadata = pageMetadata(META);

export default function PartiesPage() {
  const data = getParties();
  return (
    <div>
      <h1 className="page-title">Parties</h1>
      <p className="page-intro">
        Each person and entity is described <b>only by their public role</b> in
        the dispute and their publicly reported statements. No private personal
        information is included.
      </p>
      <SectionedTable data={data} searchPlaceholder="Search parties…" />
    </div>
  );
}
