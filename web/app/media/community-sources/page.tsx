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
export const metadata = pageMetadata(META);

export default function CommunitySourcesPage() {
  const md = getProse("community-sources.md");
  return (
    <>
      <PageStructuredData {...META} dateModified={generatedMtime("content/community-sources.md").toISOString()} />
      <Markdown>{md}</Markdown>
    </>
  );
}
