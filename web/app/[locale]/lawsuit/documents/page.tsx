import type { Metadata } from "next";
import { Markdown } from "@/components/Markdown";
import { getProse, generatedMtime } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Court Documents",
  description:
    "Where to find the primary court filings for the Bricks & Minifigs (BAM) – Reckless Ben case: the authoritative clerk record (Utah XChange / Oregon eCourt) and community-compiled mirrors.",
  path: "/lawsuit/documents",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(META, locale);
}

export default async function CourtDocumentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const md = getProse("lawsuit-documents.md", locale);
  return (
    <>
      <PageStructuredData {...META} locale={locale} dateModified={generatedMtime("content/lawsuit-documents.md").toISOString()} />
      <Markdown locale={locale}>{md}</Markdown>
    </>
  );
}
