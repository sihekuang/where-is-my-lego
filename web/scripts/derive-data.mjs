// derive-data.mjs — Build-time derivation of structured data from the canonical
// Markdown archive at the repository root. ZERO dependencies (plain Node).
//
// Reads the original .md files (which are NEVER modified) and writes:
//   web/.generated/data/*.json   — structured records for interactive views
//   web/.generated/content/*.md  — prose copies for the prose pages
//
// Everything it writes lives under web/.generated/ which is git-ignored, so the
// derived data is a pure build artifact and can never drift from the source.

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(SCRIPT_DIR, "..");
const ROOT = resolve(WEB, "..");
const OUT_DATA = resolve(WEB, ".generated/data");
const OUT_CONTENT = resolve(WEB, ".generated/content");

// ---------------------------------------------------------------------------
// Generic Markdown table parser
// ---------------------------------------------------------------------------

const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
const isSeparator = (l) => /^\s*\|[\s:|-]+\|\s*$/.test(l) && l.includes("-");

function splitCells(line) {
  // Drop the leading/trailing pipe, then split. (Cells in this archive never
  // contain escaped pipes, so a plain split is safe.)
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((c) => c.trim());
}

// Strip inline Markdown to plain text (used only for search indexing).
function toPlain(md) {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links -> text
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Parse a file into sections; each section carries the nearest preceding
// heading and any tables under it.
function parseSections(md) {
  const lines = md.split(/\r?\n/);
  const sections = [];
  let heading = null;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) {
      heading = h[1].replace(/[*`]/g, "").trim();
      i++;
      continue;
    }
    if (isTableRow(line) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const columns = splitCells(line);
      i += 2; // skip header + separator
      const rows = [];
      while (i < lines.length && isTableRow(lines[i]) && !isSeparator(lines[i])) {
        const cells = splitCells(lines[i]);
        rows.push({
          cells,
          plain: cells.map(toPlain).join(" • "),
        });
        i++;
      }
      sections.push({ heading: heading || "", columns, rows });
      continue;
    }
    i++;
  }
  return sections;
}

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

// Parse a fuzzy human date string (e.g. "Late 2024 – early 2026",
// "**Nov 22, 2023**", "Ongoing (as of Jun 3, 2026)") into a sortable
// { y, m, d }. Returns null when no year is present, so the caller can
// anchor the row to its predecessor.
export function parseDateKey(raw) {
  if (!raw) return null;
  const s = raw.toLowerCase();

  // Prefer the date inside an "as of <date>" parenthetical when present.
  const asOf = s.match(/as of\s+([^)]+)/);
  const scope = asOf ? asOf[1] : s;

  // First 4-digit year wins, so a range sorts by its START year.
  const yearMatch = scope.match(/\b(?:19|20)\d{2}\b/);
  if (!yearMatch) return null;
  const y = parseInt(yearMatch[0], 10);

  // First month name, if any.
  const monMatch = scope.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/
  );
  let m = monMatch ? MONTHS[monMatch[1]] : 0;

  // First standalone 1–2 digit number (not part of the 4-digit year).
  const dayMatch = scope.match(/(?<!\d)(\d{1,2})(?!\d)/);
  let d = dayMatch ? parseInt(dayMatch[1], 10) : 0;

  // Leading season/precision qualifier (position-based: the one nearest the
  // start of the string qualifies the start year).
  const qualMatch = scope.match(/\b(early|spring|mid|late|end)\b/);
  const qual = qualMatch ? qualMatch[1] : null;

  if (m === 0) {
    m =
      qual === "early" || qual === "spring" ? 2 :
      qual === "mid" ? 6 :
      qual === "late" || qual === "end" ? 11 :
      6; // bare year → mid-year neutral
  }
  if (d === 0 && qual) {
    d =
      qual === "early" || qual === "spring" ? 5 :
      qual === "late" || qual === "end" ? 25 :
      0;
  }

  return { y, m, d };
}

function classifyStatus(text) {
  const s = text.toUpperCase();
  if (s.includes("CONFIRMED")) return "confirmed";
  if (s.includes("ALLEGATION")) return "allegation";
  return "reported";
}

// ---------------------------------------------------------------------------
// File-specific derivation
// ---------------------------------------------------------------------------

function read(rel) {
  return readFileSync(resolve(ROOT, rel), "utf8");
}

export function deriveTimeline() {
  const sections = parseSections(read("timeline.md"));
  // The chronological table is the one whose columns include "Status".
  const table = sections.find((s) =>
    s.columns.some((c) => /status/i.test(c))
  );
  if (!table) throw new Error("timeline.md: status table not found");
  const statusIdx = table.columns.findIndex((c) => /status/i.test(c));
  const dateIdx = table.columns.findIndex((c) => /date/i.test(c));
  const dateCol = dateIdx >= 0 ? dateIdx : 0;

  // Walk rows in source order; rows whose date has no year inherit the
  // previous row's key so they stay glued to the event they follow.
  let last = { y: 0, m: 0, d: 0 };
  const rows = table.rows.map((r, i) => {
    const key = parseDateKey(r.cells[dateCol]) ?? last;
    last = key;
    return {
      cells: r.cells,
      plain: r.plain,
      status: classifyStatus(r.cells[statusIdx] || ""),
      sort: key,
      order: i,
    };
  });
  return { columns: table.columns, statusIdx, rows };
}

function deriveSectioned(rel, opts = {}) {
  const skip = opts.skipHeadings || [];
  const sections = parseSections(read(rel))
    .filter((s) => s.rows.length > 0)
    .filter((s) => !skip.includes(s.heading));
  return { sections };
}

// ---------------------------------------------------------------------------
// Prose copies (links are rewritten at render time, not here)
// ---------------------------------------------------------------------------

const PROSE = [
  ["README.md", "home.md"],
  ["DISCLAIMER.md", "disclaimer.md"],
  ["lawsuit/README.md", "lawsuit.md"],
  ["lawsuit/court-documents.md", "lawsuit-documents.md"],
  ["police-controversy.md", "police.md"],
  ["media/download_manifest.md", "media-manifest.md"],
];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

function writeJson(name, obj) {
  writeFileSync(resolve(OUT_DATA, name), JSON.stringify(obj, null, 2));
}

function main() {
  if (existsSync(resolve(WEB, ".generated")))
    rmSync(resolve(WEB, ".generated"), { recursive: true, force: true });
  mkdirSync(OUT_DATA, { recursive: true });
  mkdirSync(OUT_CONTENT, { recursive: true });

  writeJson("timeline.json", deriveTimeline());
  writeJson("parties.json", deriveSectioned("parties.md"));
  writeJson("media-news.json", deriveSectioned("media/news-articles.md"));
  writeJson("media-primary.json", deriveSectioned("media/primary-sources.md"));

  for (const [src, dst] of PROSE) {
    writeFileSync(resolve(OUT_CONTENT, dst), read(src));
  }

  // Small manifest so the app/build can sanity-check what was produced.
  writeJson("_manifest.json", {
    generatedAt: new Date().toISOString(),
    data: ["timeline.json", "parties.json", "media-news.json", "media-primary.json"],
    content: PROSE.map(([, d]) => d),
    note: "Generated from the canonical root Markdown. Do not edit; edit the .md sources.",
  });

  console.log("derive-data: wrote data + content to web/.generated/");
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
