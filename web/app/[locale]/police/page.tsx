import type { Metadata } from "next";
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(META, locale);
}

export default async function PolicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const md = getProse("police.md", locale);
  return (
    <>
      <PageStructuredData {...META} locale={locale} dateModified={generatedMtime("content/police.md").toISOString()} />
      <Markdown>{md}</Markdown>
    </>
  );
}
