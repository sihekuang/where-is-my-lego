import { Markdown } from "@/components/Markdown";
import { getProse, generatedMtime } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Court Documents",
  description:
    "How to obtain the primary court filings for the Bricks & Minifigs (BAM) – Reckless Ben case in Utah's 4th District.",
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
