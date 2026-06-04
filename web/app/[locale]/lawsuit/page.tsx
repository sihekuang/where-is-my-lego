import type { Metadata } from "next";
import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { getProse, generatedMtime } from "@/lib/content";
import { getDict } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageStructuredData } from "@/components/JsonLd";

const META = {
  title: "Lawsuit",
  description:
    "The Utah 4th District civil case in the BAM – Reckless Ben dispute — 13 causes of action — and how to obtain the primary filings.",
  path: "/lawsuit",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(META, locale);
}

export default async function LawsuitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const md = getProse("lawsuit.md", locale);
  return (
    <div>
      <PageStructuredData {...META} locale={locale} dateModified={generatedMtime("content/lawsuit.md").toISOString()} />
      <Markdown>{md}</Markdown>
      <p className="mt-6">
        → <Link href={`/${locale}/lawsuit/documents`} className="text-primary hover:underline">{t("lawsuit.docsLink")}</Link>
      </p>
    </div>
  );
}
