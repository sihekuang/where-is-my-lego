// Maps the archive's internal Markdown links (which point at .md files) to the
// site's routes. Applied at render time so the canonical Markdown keeps its
// original GitHub-friendly relative links untouched.

const MAP: Record<string, string> = {
  "readme.md": "/",
  "timeline.md": "/timeline",
  "parties.md": "/parties",
  "disclaimer.md": "/disclaimer",
  "lawsuit/readme.md": "/lawsuit",
  "lawsuit/court-documents.md": "/lawsuit/documents",
  "court-documents.md": "/lawsuit/documents",
  "police-controversy.md": "/police",
  "media/news-articles.md": "/media",
  "media/primary-sources.md": "/media#primary",
  "media/download_manifest.md": "/media",
};

/** Rewrite an href found inside archive Markdown to a site route (or leave it). */
export function rewriteHref(href: string | undefined): string {
  if (!href) return "#";
  if (/^https?:\/\//i.test(href) || href.startsWith("#")) return href;
  // Normalize: strip ./ and ../ prefixes and lowercase for lookup.
  const key = href.replace(/^(\.\.?\/)+/, "").toLowerCase();
  if (MAP[key]) return MAP[key];
  // Fallback: a bare .md we don't know about -> strip extension.
  if (key.endsWith(".md")) return "/" + key.replace(/\.md$/, "");
  return href;
}

export const isExternal = (href: string | undefined): boolean =>
  !!href && /^https?:\/\//i.test(href);
