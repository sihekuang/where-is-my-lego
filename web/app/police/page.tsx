import { Markdown } from "@/components/Markdown";
import { getProse, generatedMtime } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Police Controversy",
  description:
    "Documented arrests, the search warrant, and the American Fork Police Department response in the BAM – Reckless Ben dispute — labeled Confirmed or Allegation.",
  path: "/police",
};
export const metadata = pageMetadata(META);

export default function PolicePage() {
  const md = getProse("police.md");
  return (
    <>
      <PageStructuredData {...META} dateModified={generatedMtime("content/police.md").toISOString()} />
      <Markdown>{md}</Markdown>
    </>
  );
}
