import { renderOgImage, loadOgCjkFont } from "@/lib/og-image";
import { getDictObject } from "@/lib/i18n";
import { getLocale } from "@/lib/locales.mjs";

export { size, contentType } from "@/lib/og-image";
export const alt = "Parties · Where Is My Lego";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const labels = getDictObject(locale);
  const title = labels["og.parties"];
  const tagline = labels["og.tagline"];
  const cjkFont = getLocale(locale)?.isCJK ? await loadOgCjkFont(title, tagline, getLocale(locale)?.ogFont) : null;
  return renderOgImage(title, { tagline, cjkFont });
}
