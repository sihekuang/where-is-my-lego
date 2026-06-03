import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { getProse } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

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
      <Markdown>{md}</Markdown>
      <p style={{ marginTop: 24 }}>
        → <Link href="/lawsuit/documents">How to obtain the primary court filings</Link>
      </p>
    </div>
  );
}
