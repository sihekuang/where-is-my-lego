import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { getProse, generatedMtime } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Lawsuit",
  description:
    "The Utah 4th District civil case in the BAM – Reckless Ben dispute — 13 causes of action — and how to obtain the primary filings.",
  path: "/lawsuit",
};
export const metadata = pageMetadata(META);

export default function LawsuitPage() {
  const md = getProse("lawsuit.md");
  return (
    <div>
      <PageStructuredData {...META} dateModified={generatedMtime("content/lawsuit.md").toISOString()} />
      <Markdown>{md}</Markdown>
      <p className="mt-6">
        → <Link href="/lawsuit/documents" className="text-primary hover:underline">How to obtain the primary court filings</Link>
      </p>
    </div>
  );
}
