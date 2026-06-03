// Server-side loaders for the generated build artifacts.
// These read ONLY from web/.generated/, which is produced by scripts/derive-data.mjs
// from the canonical root Markdown. Nothing here mutates the source archive.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const GEN = resolve(process.cwd(), ".generated");

export type Row = { cells: string[]; plain: string; status?: string };
export type Section = { heading: string; columns: string[]; rows: Row[] };
export type Sectioned = { sections: Section[] };
export type Timeline = { columns: string[]; statusIdx: number; rows: Row[] };

function json<T>(name: string): T {
  return JSON.parse(readFileSync(resolve(GEN, "data", name), "utf8")) as T;
}

export const getTimeline = () => json<Timeline>("timeline.json");
export const getParties = () => json<Sectioned>("parties.json");
export const getMediaNews = () => json<Sectioned>("media-news.json");
export const getMediaPrimary = () => json<Sectioned>("media-primary.json");

export function getProse(name: string): string {
  return readFileSync(resolve(GEN, "content", name), "utf8");
}
