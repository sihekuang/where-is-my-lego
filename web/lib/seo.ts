import type { Metadata } from "next";
import { LOCALES, DEFAULT_LOCALE, getLocale } from "@/lib/locales.mjs";

export const SITE_NAME = "Where Is My Lego";

/** Canonical base URL (no trailing slash). Defaults to production so local builds emit prod URLs. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.whereismylego.com"
).replace(/\/+$/, "");

export const DEFAULT_DESCRIPTION =
  "A sourced, read-only research archive of the Bricks & Minifigs (BAM) – Reckless Ben controversy. Content is derived from canonical Markdown.";

export const ROOT_TITLE = "Where Is My Lego — Sourced Research Archive";

/** Locale-prefixed path: "/" → "/en"; "/timeline" → "/en/timeline". */
export function localizedPath(locale: string, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** hreflang alternates for a logical path across every locale, plus x-default → the default locale. */
export function languageAlternates(path: string): Record<string, string> {
  const langs: Record<string, string> = {};
  for (const l of LOCALES) langs[l.hreflang] = localizedPath(l.code, path);
  langs["x-default"] = localizedPath(DEFAULT_LOCALE, path);
  return langs;
}

type PageMeta = { title: string; description: string; path: string };

/** Per-page Metadata for a given locale: composed <title>, locale-prefixed canonical, hreflang
 *  alternates, and self-contained OG + Twitter with the locale's OG locale tag. */
export function pageMetadata({ title, description, path }: PageMeta, locale: string = DEFAULT_LOCALE): Metadata {
  const branded = `${title} · ${SITE_NAME}`;
  const loc = getLocale(locale)!; // getLocale always falls back to the default locale
  const url = localizedPath(locale, path);
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: loc.ogLocale,
      url,
      title: branded,
      description,
    },
    twitter: { card: "summary_large_image", title: branded, description },
  };
}
