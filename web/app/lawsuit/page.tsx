import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { getProse } from "@/lib/content";

export const metadata = { title: "Lawsuit — BAM × Reckless Ben" };

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
