import { Markdown } from "@/components/Markdown";
import { getProse } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const META = {
  title: "Court Documents",
  description:
    "How to obtain the primary court filings for the Bricks & Minifigs (BAM) – Reckless Ben case in Utah's 4th District.",
  path: "/lawsuit/documents",
};
export const metadata = pageMetadata(META);

export default function CourtDocumentsPage() {
  const md = getProse("lawsuit-documents.md");
  return <Markdown>{md}</Markdown>;
}
