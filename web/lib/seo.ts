import type { Metadata } from "next";

export const SITE_NAME = "Where Is My Lego";

/** Canonical base URL (no trailing slash). Defaults to production so local builds emit prod URLs. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.whereismylego.com"
).replace(/\/+$/, "");

export const DEFAULT_DESCRIPTION =
  "A sourced, read-only research archive of the Bricks & Minifigs (BAM) – Reckless Ben controversy. Content is derived from canonical Markdown.";

export const ROOT_TITLE = "Where Is My Lego — Sourced Research Archive";

type PageMeta = { title: string; description: string; path: string };

/** Per-page Metadata: composed <title>, tailored description, canonical, self-contained OG + Twitter. */
export function pageMetadata({ title, description, path }: PageMeta): Metadata {
  const branded = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: branded,
      description,
    },
    twitter: { card: "summary_large_image", title: branded, description },
  };
}
