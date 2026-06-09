import { renderOgImage, loadOgCjkFont } from "@/lib/og-image";
import { getDictObject } from "@/lib/i18n";
import { getLocale } from "@/lib/locales.mjs";

export { size, contentType } from "@/lib/og-image";
export const alt = "Where Is My Lego — Disputed ~$200K LEGO collection";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const labels = getDictObject(locale);
  const title = labels["og.home"];
  // Home card: title is itself the tagline-style line, so let the sub fall back to the brand
  // subtitle ("BAM × Reckless Ben") instead of repeating a near-identical translation.
  const cjkFont = getLocale(locale)?.isCJK ? await loadOgCjkFont(title, title, getLocale(locale)?.ogFont) : null;
  return renderOgImage(title, { tagline: title, cjkFont });
}
