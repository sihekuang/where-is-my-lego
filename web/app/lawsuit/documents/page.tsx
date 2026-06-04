import { Markdown } from "@/components/Markdown";
import { getProse, generatedMtime } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Court Documents",
  description:
    "Where to find the primary court filings for the Bricks & Minifigs (BAM) – Reckless Ben case: the authoritative clerk record (Utah XChange / Oregon eCourt) and community-compiled mirrors.",
  path: "/lawsuit/documents",
};
export const metadata = pageMetadata(META);

export default function CourtDocumentsPage() {
  const md = getProse("lawsuit-documents.md");
  return (
    <>
      <PageStructuredData {...META} dateModified={generatedMtime("content/lawsuit-documents.md").toISOString()} />
      <Markdown>{md}</Markdown>
    </>
  );
}
