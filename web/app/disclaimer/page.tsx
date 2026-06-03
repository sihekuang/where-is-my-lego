import { Markdown } from "@/components/Markdown";
import { getProse, generatedMtime } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Disclaimer",
  description:
    "Scope, methodology, sourcing, and limitations of this read-only archive of the BAM – Reckless Ben controversy. No court has found any party liable.",
  path: "/disclaimer",
};
export const metadata = pageMetadata(META);

export default function DisclaimerPage() {
  const md = getProse("disclaimer.md");
  return (
    <>
      <PageStructuredData {...META} dateModified={generatedMtime("content/disclaimer.md").toISOString()} />
      <Markdown>{md}</Markdown>
    </>
  );
}
