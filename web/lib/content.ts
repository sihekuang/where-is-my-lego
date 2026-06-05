// Server-side loaders for the generated build artifacts.
// These read ONLY from web/.generated/, which is produced by scripts/derive-data.mjs
// from the canonical root Markdown. Nothing here mutates the source archive.

import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_LOCALE } from "@/lib/locales.mjs";
import { overlayTimeline, overlaySectioned, overlayGraph } from "@/lib/overlay";

const GEN = resolve(process.cwd(), ".generated");
const I18N = resolve(process.cwd(), "i18n");

/** Loads a per-locale translation overlay file, or null (→ English) when absent/default. */
function trJson<T>(locale: string, name: string): T | null {
  if (locale === DEFAULT_LOCALE) return null;
  try {
    return JSON.parse(readFileSync(resolve(I18N, locale, "data", name), "utf8")) as T;
  } catch (err) {
    // A missing file is the normal "not seeded yet" case → silent English fallback.
    // A malformed (committed-but-broken) file should be surfaced, not hidden.
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`[i18n] ${locale}/data/${name} unreadable; falling back to English:`, err);
    }
    return null;
  }
}

export type Row = {
  cells: string[];
  plain: string;
  status?: string;
  sort?: { y: number; m: number; d: number };
  order?: number;
  /** DOM anchor id ("party-<nodeId>") when this row maps to a relationship-graph node. */
  anchor?: string;
};
export type Section = { heading: string; columns: string[]; rows: Row[] };
export type Sectioned = { sections: Section[] };
export type Timeline = {
  columns: string[];
  statusIdx: number;
  dateIdx: number;
  eventIdx: number;
  sourceIdx: number;
  rows: Row[];
};

export type GraphNode = {
  id: string;
  label: string;
  type: "person" | "org" | "agency";
  side: "plaintiff" | "defendant" | "official" | "neutral";
  ini: string;
  fig: string;
  icon?: string;
  role?: string;
  statement?: string;
};
export type GraphEdge = {
  source: string;
  target: string;
  label: string;
  category: "legal" | "corporate" | "familial" | "personal" | "transactional" | "investigative" | "law-enforcement";
  direction: "to" | "both" | "none";
  status: "CONFIRMED" | "ALLEGATION";
  note?: string;
};
export type GraphData = { nodes: GraphNode[]; edges: GraphEdge[] };

function json<T>(name: string): T {
  return JSON.parse(readFileSync(resolve(GEN, "data", name), "utf8")) as T;
}

export const getTimeline = (locale = DEFAULT_LOCALE) =>
  overlayTimeline(json<Timeline>("timeline.json"), trJson(locale, "timeline.json"));
export const getParties = (locale = DEFAULT_LOCALE) =>
  overlaySectioned(json<Sectioned>("parties.json"), trJson(locale, "parties.json"));
export const getRelationships = (locale = DEFAULT_LOCALE) =>
  overlayGraph(json<GraphData>("relationships.json"), trJson(locale, "relationships.json"));
export const getMediaNews = (locale = DEFAULT_LOCALE) =>
  overlaySectioned(json<Sectioned>("media-news.json"), trJson(locale, "media-news.json"));
export const getMediaPrimary = (locale = DEFAULT_LOCALE) =>
  overlaySectioned(json<Sectioned>("media-primary.json"), trJson(locale, "media-primary.json"));

export function getProse(name: string, locale = DEFAULT_LOCALE): string {
  if (locale !== DEFAULT_LOCALE) {
    try { return readFileSync(resolve(I18N, locale, "content", name), "utf8"); } catch { /* fall through */ }
  }
  return readFileSync(resolve(GEN, "content", name), "utf8");
}

/** Modification time of a build artifact under .generated/ (used for sitemap + Article dates).
 *  Falls back to the current (build) time if the artifact is missing. */
export function generatedMtime(relPath: string): Date {
  try {
    return statSync(resolve(GEN, relPath)).mtime;
  } catch {
    return new Date();
  }
}
