import SectionedTable from "@/components/SectionedTable";
import RelationshipGraph from "@/components/RelationshipGraph";
import { getParties, getRelationships, generatedMtime } from "@/lib/content";
import { getDict } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Parties",
  description:
    "The people and entities in the Bricks & Minifigs (BAM) – Reckless Ben dispute, described only by their public roles and publicly reported statements.",
  path: "/parties",
};
export const metadata = pageMetadata(META);

export default async function PartiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const data = getParties(locale);
  const graph = getRelationships(locale);
  return (
    <div>
      <PageStructuredData {...META} dateModified={generatedMtime("data/parties.json").toISOString()} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{t("nav.parties")}</h1>
      <p className="mt-2 max-w-[70ch] text-muted-foreground">
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
