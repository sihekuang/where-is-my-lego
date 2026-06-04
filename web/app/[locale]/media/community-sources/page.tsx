import type { Metadata } from "next";
import { Markdown } from "@/components/Markdown";
import { getProse, generatedMtime } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Community-Curated Sources",
  description:
    "Primary sources the r/RecklessBen community compiled for the Bricks & Minifigs (BAM) – Reckless Ben case: court filings, public records, official statements, and video coverage — linked, not re-hosted. Defense-aligned; verify before relying.",
  path: "/media/community-sources",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(META, locale);
}

export default async function CommunitySourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const md = getProse("community-sources.md", locale);
  return (
    <>
      <PageStructuredData {...META} locale={locale} dateModified={generatedMtime("content/community-sources.md").toISOString()} />
      <Markdown>{md}</Markdown>
    </>
  );
}
