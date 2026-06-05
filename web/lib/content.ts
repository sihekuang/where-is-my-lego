// Server-side loaders for the generated build artifacts.
// These read ONLY from web/.generated/, which is produced by scripts/derive-data.mjs
// from the canonical root Markdown. Nothing here mutates the source archive.

import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const GEN = resolve(process.cwd(), ".generated");

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
export type Timeline = { columns: string[]; statusIdx: number; rows: Row[] };

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

export const getTimeline = () => json<Timeline>("timeline.json");
export const getParties = () => json<Sectioned>("parties.json");
export const getRelationships = () => json<GraphData>("relationships.json");
export const getMediaNews = () => json<Sectioned>("media-news.json");
export const getMediaPrimary = () => json<Sectioned>("media-primary.json");

export function getProse(name: string): string {
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
