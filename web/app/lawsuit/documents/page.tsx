import { Markdown } from "@/components/Markdown";
import { getProse } from "@/lib/content";

export const metadata = { title: "Court documents — BAM × Reckless Ben" };

export default function CourtDocumentsPage() {
  const md = getProse("lawsuit-documents.md");
  return <Markdown>{md}</Markdown>;
}
