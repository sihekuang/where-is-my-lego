import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { generatedMtime } from "@/lib/content";

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
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: generatedMtime(r.file),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
