import type { Metadata } from "next";
import { Markdown } from "@/components/Markdown";
import { getProse, generatedMtime } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getDict } from "@/lib/i18n";

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
  const t = getDict(locale);
  const md = getProse("lawsuit-documents.md", locale);
  const trail = [
    { name: t("nav.overview"), href: `/${locale}` },
    { name: t("nav.lawsuit"), href: `/${locale}/lawsuit` },
    { name: t("og.documents") },
  ];
  return (
    <>
      <PageStructuredData {...META} locale={locale} dateModified={generatedMtime("content/lawsuit-documents.md").toISOString()} breadcrumb={trail} />
      <Breadcrumbs trail={trail} />
      <Markdown locale={locale}>{md}</Markdown>
    </>
  );
}
