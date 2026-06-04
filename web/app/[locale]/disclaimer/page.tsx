import type { Metadata } from "next";
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(META, locale);
}

export default async function DisclaimerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const md = getProse("disclaimer.md", locale);
  return (
    <>
      <PageStructuredData {...META} locale={locale} dateModified={generatedMtime("content/disclaimer.md").toISOString()} />
      <Markdown>{md}</Markdown>
    </>
  );
}
