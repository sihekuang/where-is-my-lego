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
// Relationship graph derivation
// ---------------------------------------------------------------------------

const NODE_TYPES = new Set(["person", "org", "agency"]);
const SIDES = new Set(["plaintiff", "defendant", "official", "neutral"]);
const CATEGORIES = new Set([
  "legal", "corporate", "familial", "personal", "transactional", "investigative", "law-enforcement",
]);
const STATUSES = new Set(["CONFIRMED", "ALLEGATION"]);
// person-type node ids permitted to carry an Icon (public figures only).
const ICON_ALLOWLIST = new Set(["ben-schneider"]);

function findTable(sections, required) {
  return sections.find((s) => {
    const cols = s.columns.map((c) => c.toLowerCase());
    return required.every((r) => cols.includes(r));
  });
}

function colMap(table, names) {
  const map = {};
  for (const name of names) {
    map[name] = table.columns.findIndex((c) => c.toLowerCase() === name);
  }
  return map;
}

function normalizeDirection(raw) {
  const t = (raw || "").trim();
  if (t === "→" || t === "->" || t === "to") return "to";
  if (t === "↔" || t === "<->" || t === "both") return "both";
  if (t === "—" || t === "-" || t === "" || t === "none") return "none";
  throw new Error(`relationships.md: unknown Direction "${raw}"`);
}

export function initialsFor(label) {
  const words = label
    .replace(/\(.*?\)/g, " ")        // drop parentheticals like "(Schneider)"
    .replace(/[^A-Za-z0-9 ]/g, " ")  // drop punctuation/quotes
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// Best-effort drift guard: warn if a party named in parties.md has no graph node.
function reconcileParties(partiesMd, labels, warn) {
  const sections = parseSections(partiesMd);
  const lowered = labels.map((l) => l.toLowerCase());
  for (const s of sections) {
    const nameIdx = s.columns.findIndex((c) => /name|entity|official/i.test(c));
    if (nameIdx < 0) continue;
    for (const r of s.rows) {
      const name = toPlain(r.cells[nameIdx] || "");
      const sig = name.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w.length >= 4);
      if (sig.length && !sig.some((w) => lowered.some((l) => l.includes(w)))) {
        warn(`parties.md lists "${name}" but no graph node matches; add it to relationships.md.`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Deterministic 2D layout (Fruchterman–Reingold style). Pure & dependency-free
// so it runs in the zero-dep derive step and produces byte-identical output every
// run (seeded from node ids). Result: each node gets `pos:{x,y}` normalized to
// [0,1], consumed by the homepage hero canvas AND the OG graph still so the two
// always show the SAME composition.
// ---------------------------------------------------------------------------

// FNV-1a hash of a string → two deterministic unit floats in [0,1).
function seededUnit(id) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const a = (h >>> 0) / 4294967296;
  const h2 = Math.imul(h ^ 0x9e3779b9, 2654435761) >>> 0;
  const b = (h2 >>> 0) / 4294967296;
  return [a, b];
}

export function layoutRelationships(nodes, edges, opts = {}) {
  const iterations = opts.iterations ?? 400;
  const k = Math.sqrt(1 / Math.max(1, nodes.length)); // ideal edge length in unit square
  const pos = new Map();
  for (const n of nodes) {
    const [a, b] = seededUnit(n.id);
    pos.set(n.id, { x: a, y: b });
  }

  let temp = 0.1;
  const cool = temp / (iterations + 1);

  for (let it = 0; it < iterations; it++) {
    const disp = new Map(nodes.map((n) => [n.id, { x: 0, y: 0 }]));

    // Repulsion between every pair.
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const pa = pos.get(nodes[i].id), pb = pos.get(nodes[j].id);
        const dx = pa.x - pb.x, dy = pa.y - pb.y;
        const dist = Math.hypot(dx, dy) || 1e-4;
        const force = (k * k) / dist;
        const ux = dx / dist, uy = dy / dist;
        const di = disp.get(nodes[i].id), dj = disp.get(nodes[j].id);
        di.x += ux * force; di.y += uy * force;
        dj.x -= ux * force; dj.y -= uy * force;
      }
    }

    // Attraction along edges.
    for (const e of edges) {
      const pa = pos.get(e.source), pb = pos.get(e.target);
      if (!pa || !pb) continue;
      const dx = pa.x - pb.x, dy = pa.y - pb.y;
      const dist = Math.hypot(dx, dy) || 1e-4;
      const force = (dist * dist) / k;
      const ux = dx / dist, uy = dy / dist;
      const ds = disp.get(e.source), dt = disp.get(e.target);
      ds.x -= ux * force; ds.y -= uy * force;
      dt.x += ux * force; dt.y += uy * force;
    }

    // Apply, capped by temperature.
    for (const n of nodes) {
      const d = disp.get(n.id);
      const len = Math.hypot(d.x, d.y) || 1e-4;
      const p = pos.get(n.id);
      p.x += (d.x / len) * Math.min(len, temp);
      p.y += (d.y / len) * Math.min(len, temp);
    }
    temp -= cool;
  }

  // Normalize to [margin, 1-margin] by bounding box (4-dp rounding keeps output stable).
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const p = pos.get(n.id);
    if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y;
  }
  const spanX = (maxX - minX) || 1, spanY = (maxY - minY) || 1;
  const margin = 0.07;
  const r4 = (v) => Math.round(v * 1e4) / 1e4;
  for (const n of nodes) {
    const p = pos.get(n.id);
    n.pos = {
      x: r4(margin + (1 - 2 * margin) * (p.x - minX) / spanX),
      y: r4(margin + (1 - 2 * margin) * (p.y - minY) / spanY),
    };
  }
  return nodes;
}

export function deriveRelationships(opts = {}) {
  const md = opts.md ?? read("relationships.md");
  const partiesMd = opts.partiesMd ?? read("parties.md");
  const warn = opts.warn ?? ((m) => console.warn("derive-data: " + m));

  const sections = parseSections(md);
  const nodeTable = findTable(sections, ["id", "label", "type", "side"]);
  const edgeTable = findTable(sections, ["source", "relationship", "target", "category"]);
  if (!nodeTable) throw new Error("relationships.md: Nodes table not found");
  if (!edgeTable) throw new Error("relationships.md: Edges table not found");

  const n = colMap(nodeTable, ["id", "label", "type", "side", "icon", "role", "statement"]);
  const nodes = nodeTable.rows.map((r) => {
    const id = r.cells[n.id];
    const label = r.cells[n.label];
    const type = r.cells[n.type];
    const side = r.cells[n.side];
    if (!NODE_TYPES.has(type)) throw new Error(`relationships.md: node "${id}" has unknown Type "${type}"`);
    if (!SIDES.has(side)) throw new Error(`relationships.md: node "${id}" has unknown Side "${side}"`);
    const icon = n.icon >= 0 ? (r.cells[n.icon] || "").trim() : "";
    const node = { id, label, type, side, ini: initialsFor(label) };
    if (icon) {
      if (type === "person" && !ICON_ALLOWLIST.has(id)) {
        warn(`node "${id}" is a person with an Icon but not in the public-figure allowlist; dropping icon (ethics guard).`);
      } else {
        node.icon = icon;
      }
    }
    if (n.role >= 0 && r.cells[n.role]) node.role = r.cells[n.role];
    if (n.statement >= 0 && r.cells[n.statement]) node.statement = r.cells[n.statement];
    return node;
  });

  const ids = new Set(nodes.map((x) => x.id));
  const e = colMap(edgeTable, ["source", "relationship", "target", "category", "direction", "status", "note"]);
  const edges = edgeTable.rows.map((r, i) => {
    const source = r.cells[e.source];
    const target = r.cells[e.target];
    const category = r.cells[e.category];
    if (!ids.has(source)) throw new Error(`relationships.md: edge ${i} source "${source}" is not a known node id`);
    if (!ids.has(target)) throw new Error(`relationships.md: edge ${i} target "${target}" is not a known node id`);
    if (!CATEGORIES.has(category)) throw new Error(`relationships.md: edge ${i} has unknown Category "${category}"`);
    const direction = normalizeDirection(e.direction >= 0 ? r.cells[e.direction] : "to");
    const status = (e.status >= 0 ? r.cells[e.status] : "CONFIRMED").toUpperCase();
    if (!STATUSES.has(status)) throw new Error(`relationships.md: edge ${i} has unknown Status "${status}"`);
    const edge = { source, target, label: r.cells[e.relationship], category, direction, status };
    if (e.note >= 0 && r.cells[e.note]) edge.note = r.cells[e.note];
    return edge;
  });

  reconcileParties(partiesMd, nodes.map((x) => x.label), warn);
  layoutRelationships(nodes, edges);
  return { nodes, edges };
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

  // Walk rows in source order; rows whose date has no year inherit a COPY of
  // the previous row's key so they stay glued to the event they follow without
  // sharing a mutable object reference.
  let last = { y: 0, m: 0, d: 0 };
  const rows = table.rows.map((r, i) => {
    const key = parseDateKey(r.cells[dateCol]) ?? { ...last };
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
  ["media/community-sources.md", "community-sources.md"],
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
  writeJson("relationships.json", deriveRelationships());
  writeJson("media-news.json", deriveSectioned("media/news-articles.md"));
  writeJson("media-primary.json", deriveSectioned("media/primary-sources.md"));

  for (const [src, dst] of PROSE) {
    writeFileSync(resolve(OUT_CONTENT, dst), read(src));
  }

  // Small manifest so the app/build can sanity-check what was produced.
  writeJson("_manifest.json", {
    generatedAt: new Date().toISOString(),
    data: ["timeline.json", "parties.json", "media-news.json", "media-primary.json", "relationships.json"],
    content: PROSE.map(([, d]) => d),
    note: "Generated from the canonical root Markdown. Do not edit; edit the .md sources.",
  });

  console.log("derive-data: wrote data + content to web/.generated/");
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
