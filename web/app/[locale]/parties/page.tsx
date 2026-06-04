import type { Metadata } from "next";
import SectionedTable from "@/components/SectionedTable";
import RelationshipGraph from "@/components/RelationshipGraph";
import { getParties, getRelationships, generatedMtime } from "@/lib/content";
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
  const data = getParties(locale);
  const graph = getRelationships(locale);
  return (
    <div>
      <PageStructuredData {...META} locale={locale} dateModified={generatedMtime("data/parties.json").toISOString()} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{t("nav.parties")}</h1>
      <p className="mt-2 max-w-[70ch] text-muted-foreground">
        <Rich text={t("parties.intro")} />
      </p>

      <RelationshipGraph data={graph} labels={labels} disclaimerHref={`/${locale}/disclaimer`} />

      <div id="roster">
        <SectionedTable data={data} labels={labels} searchPlaceholder={t("parties.search")} />
      </div>
    </div>
  );
}
