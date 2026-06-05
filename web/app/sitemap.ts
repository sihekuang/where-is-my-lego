import type { MetadataRoute } from "next";
import { SITE_URL, localizedPath } from "@/lib/seo";
import { generatedMtime } from "@/lib/content";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locales.mjs";

type Entry = {
  path: string;
  file: string; // generated artifact whose mtime represents this route
  priority: number;
  changeFrequency: "weekly" | "monthly";
};

const ROUTES: Entry[] = [
  { path: "/", file: "content/home.md", priority: 1.0, changeFrequency: "weekly" },
  { path: "/timeline", file: "data/timeline.json", priority: 0.9, changeFrequency: "weekly" },
  { path: "/police", file: "content/police.md", priority: 0.9, changeFrequency: "weekly" },
  { path: "/parties", file: "data/parties.json", priority: 0.8, changeFrequency: "weekly" },
  { path: "/lawsuit", file: "content/lawsuit.md", priority: 0.8, changeFrequency: "weekly" },
  { path: "/media", file: "data/media-news.json", priority: 0.8, changeFrequency: "weekly" },
  { path: "/media/community-sources", file: "content/community-sources.md", priority: 0.6, changeFrequency: "weekly" },
  { path: "/lawsuit/documents", file: "content/lawsuit-documents.md", priority: 0.5, changeFrequency: "monthly" },
  { path: "/disclaimer", file: "content/disclaimer.md", priority: 0.5, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const r of ROUTES) {
    const lastModified = generatedMtime(r.file);
    // Every locale version of this route lists the full hreflang set (incl. x-default).
    const languages: Record<string, string> = {};
    for (const l of LOCALES) languages[l.hreflang] = `${SITE_URL}${localizedPath(l.code, r.path)}`;
    languages["x-default"] = `${SITE_URL}${localizedPath(DEFAULT_LOCALE, r.path)}`;
    for (const l of LOCALES) {
      entries.push({
        url: `${SITE_URL}${localizedPath(l.code, r.path)}`,
        lastModified,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
        alternates: { languages },
      });
    }
  }
  return entries;
}
