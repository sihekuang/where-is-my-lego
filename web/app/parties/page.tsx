import SectionedTable from "@/components/SectionedTable";
import { getParties } from "@/lib/content";

export const metadata = { title: "Parties — BAM × Reckless Ben" };

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
