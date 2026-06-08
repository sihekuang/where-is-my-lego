import type { Metadata } from "next";
import SectionedTable from "@/components/SectionedTable";
import RelationshipGraph from "@/components/RelationshipGraph";
import { getParties, getRelationships, generatedMtime } from "@/lib/content";
import { withRosterAnchors } from "@/lib/roster-anchors";
import { getDict, getDictObject } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";
import { Rich } from "@/components/Rich";

const META = {
  title: "Parties",
  description:
    "The people and entities in the Bricks & Minifigs (BAM) – Reckless Ben dispute, described only by their public roles and publicly reported statements.",
  path: "/parties",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(META, locale);
}

export default async function PartiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const labels = getDictObject(locale);
  const graph = getRelationships(locale);
  // Roster anchors are matched on the canonical English names/ids (the matcher is
  // ASCII-token based and node ids are locale-independent), then applied positionally
  // onto the translated table so the graph→roster jump links work in every locale.
  const { sections: anchoredEn, rosterIds } = withRosterAnchors(getParties(), getRelationships().nodes);
  const translated = getParties(locale);
  const sections = translated.sections.map((s, si) => ({
    ...s,
    rows: s.rows.map((r, ri) => {
      const anchor = anchoredEn[si]?.rows[ri]?.anchor;
      return anchor ? { ...r, anchor } : r;
    }),
  }));
  return (
    <div>
      <PageStructuredData {...META} locale={locale} dateModified={generatedMtime("data/parties.json").toISOString()} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{t("nav.parties")}</h1>
      <p className="mt-2 max-w-[70ch] text-muted-foreground">
        <Rich text={t("parties.intro")} />
      </p>

      <RelationshipGraph data={graph} labels={labels} disclaimerHref={`/${locale}/disclaimer`} rosterIds={rosterIds} />

      <div id="roster">
        <SectionedTable data={{ sections }} labels={labels} searchPlaceholder={t("parties.search")} locale={locale} />
      </div>
    </div>
  );
}
