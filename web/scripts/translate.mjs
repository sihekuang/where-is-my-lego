// translate.mjs — build-time translation pipeline. Pure transforms + an
// injectable translator; the real Anthropic call is lazy-imported so tests and
// --check never need the SDK or an API key.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TARGET_LOCALES } from "../lib/locales.mjs";
import { findViolations } from "../lib/glossary.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(SCRIPT_DIR, "..");
const GEN = resolve(WEB, ".generated");
const I18N = resolve(WEB, "i18n");

const UNIT_SEP = "\u0001"; // control char: a field separator that won't occur in archive text

export const sha256 = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);
export const hashProse = (md) => sha256(md);
export const hashColumns = (cols) => sha256(cols.join(UNIT_SEP));
export const hashRow = (cells) => sha256(cells.join(UNIT_SEP));
export const hashNode = (n) => sha256([n.label, n.role || "", n.statement || ""].join(UNIT_SEP));
export const hashEdge = (e) => sha256([e.label, e.note || ""].join(UNIT_SEP));

/** Keys present in `current` whose hash differs from `stored` (or is missing). */
export function diffManifest(current, stored) {
  const stale = [];
  for (const [k, h] of Object.entries(current)) {
    if (stored[k] !== h) stale.push(k);
  }
  return stale;
}

// Prose docs as written by derive-data.mjs into .generated/content/.
export const PROSE_DOCS = [
  "home.md", "disclaimer.md", "lawsuit.md", "lawsuit-documents.md", "police.md",
  "community-sources.md",
];

/**
 * Split a prose doc into drift units: the preamble plus one block per `## `
 * section. Lossless — `splitProse(md).join("") === md` — so untouched blocks
 * reassemble byte-for-byte and hand-corrections in them survive any reseed.
 */
export function splitProse(md) {
  const out = [];
  let start = 0;
  const re = /^## /gm;
  let m;
  while ((m = re.exec(md))) {
    if (m.index > start) out.push(md.slice(start, m.index));
    start = m.index;
  }
  out.push(md.slice(start));
  return out;
}

/**
 * Migration shim for manifests written before per-section prose keys: a stored
 * whole-file hash (`prose:<name>`) that still matches the current source
 * vouches for every section block, so the committed translation is reused
 * without any API call. Pure; used by both --check and seeding.
 */
export function expandStoredProse(stored, sources) {
  const out = { ...stored };
  for (const [name, src] of Object.entries(sources)) {
    if (stored[`prose:${name}`] === hashProse(src)) {
      splitProse(src).forEach((b, i) => { out[`prose:${name}#${i}`] = hashProse(b); });
    }
  }
  return out;
}

/**
 * Pure prose seeding, per `## `-section block (keys `prose:<name>#<i>`). For
 * each block: if its hash matches the stored manifest AND the prior translation
 * splits into the same number of blocks (positional pairing is only trustworthy
 * when the section structure aligns), reuse the prior block — preserving human
 * edits; otherwise call `translate` on just that block. A mid-doc section
 * insert shifts later indices and re-translates them (same convention as table
 * rows: append new sections at the end). Returns files + manifest + stale keys.
 */
export function seedProse(sources, stored0, translate, prev = {}) {
  const stored = expandStoredProse(stored0, sources);
  const files = {};
  const manifest = {};
  const stale = [];
  for (const [name, src] of Object.entries(sources)) {
    const blocks = splitProse(src);
    const prevBlocks = prev[name] != null ? splitProse(prev[name]) : null;
    const aligned = prevBlocks != null && prevBlocks.length === blocks.length;
    const out = blocks.map((block, i) => {
      const key = `prose:${name}#${i}`;
      manifest[key] = hashProse(block);
      if (stored[key] === manifest[key] && aligned) {
        return prevBlocks[i]; // unchanged -> keep prior (possibly human-corrected)
      }
      stale.push(key);
      return translate(block);
    });
    files[name] = out.join("");
  }
  return { files, manifest, stale };
}

/**
 * Pure UI-dictionary seeding. `enSource` is i18n/ui/en.json (a flat {key: english}).
 * Per key: reuse the prior translation when the English value's hash is unchanged,
 * else call `translate`. Returns the locale dict + manifest (ui:<key>) + stale keys.
 */
export function seedUiDict(enSource, stored, translate, prev = {}) {
  const dict = {};
  const manifest = {};
  const stale = [];
  for (const [key, val] of Object.entries(enSource)) {
    const mkey = `ui:${key}`;
    const h = hashProse(val);
    manifest[mkey] = h;
    if (stored[mkey] === h && prev[key] != null) {
      dict[key] = prev[key]; // unchanged -> keep prior (possibly human-corrected)
    } else {
      dict[key] = translate(val);
      stale.push(mkey);
    }
  }
  return { dict, manifest, stale };
}

function readIfExists(p) { return existsSync(p) ? readFileSync(p, "utf8") : null; }
function readJson(p) { const s = readIfExists(p); return s ? JSON.parse(s) : null; }
function writeOut(p, s) { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); }

function loadSources() {
  const sources = {};
  for (const name of PROSE_DOCS) {
    sources[name] = readFileSync(resolve(GEN, "content", name), "utf8");
  }
  return sources;
}

const SECTIONED_FILES = ["parties.json", "media-news.json", "media-primary.json"];

function loadStructured() {
  const j = (p) => JSON.parse(readFileSync(resolve(GEN, "data", p), "utf8"));
  return {
    timeline: j("timeline.json"),
    relationships: j("relationships.json"),
    sectioned: Object.fromEntries(SECTIONED_FILES.map((f) => [f, j(f)])),
  };
}

/**
 * Run all structured extractors once with a SYNCHRONOUS `translate`.
 * `prev` is the locale's prior translations: { timeline, relationships, sectioned: {file: obj} }
 * (any may be null). Returns { writes: {relFile: translatedObj}, manifest }.
 */
function runStructured(structured, stored, prev, translate) {
  const writes = {};
  const manifest = {};
  const tl = extractTimeline(structured.timeline, stored, translate, prev.timeline ?? null);
  writes["timeline.json"] = tl.translated; Object.assign(manifest, tl.manifest);
  const gr = extractGraph(structured.relationships, stored, translate, prev.relationships ?? null);
  writes["relationships.json"] = gr.translated; Object.assign(manifest, gr.manifest);
  for (const f of SECTIONED_FILES) {
    const sec = extractSectioned(f, structured.sectioned[f], stored, translate, prev.sectioned?.[f] ?? null);
    writes[f] = sec.translated; Object.assign(manifest, sec.manifest);
  }
  return { writes, manifest };
}

// All structured unit hashes (translator-independent — identity translate, empty stored/prev).
function structuredManifest(structured) {
  return runStructured(structured, {}, {}, (s) => s).manifest;
}

// The UI dictionary source (i18n/ui/en.json): a flat {key: english string}.
function loadUiSource() {
  return JSON.parse(readFileSync(resolve(I18N, "ui", "en.json"), "utf8"));
}

function uiManifest(uiSource) {
  const m = {};
  for (const [k, v] of Object.entries(uiSource)) m[`ui:${k}`] = hashProse(v);
  return m;
}

// Current source manifest (what the English source hashes to right now).
function currentManifest(sources, structured, uiSource) {
  const m = {};
  for (const [name, src] of Object.entries(sources)) {
    splitProse(src).forEach((b, i) => { m[`prose:${name}#${i}`] = hashProse(b); });
  }
  Object.assign(m, structuredManifest(structured));
  Object.assign(m, uiManifest(uiSource));
  return m;
}

// Committed translation files for a locale: data tables, prose content, and the UI dict.
function committedFiles(code) {
  const files = [];
  for (const sub of ["data", "content"]) {
    const dir = join(I18N, code, sub);
    if (existsSync(dir)) for (const f of readdirSync(dir)) if (sub === "content" || f.endsWith(".json")) files.push(join(dir, f));
  }
  const ui = join(I18N, "ui", `${code}.json`);
  if (existsSync(ui)) files.push(ui);
  return files;
}

// Non-fatal glossary scan: warns if any committed translation contains a forbidden
// rendering (e.g. American Fork transliterated, AFPD expanded to Air Force). The
// hard gate is scripts/glossary.test.mjs, which fails the build on the same finding.
function runGlossaryScan() {
  let total = 0;
  for (const loc of TARGET_LOCALES) {
    for (const file of committedFiles(loc.code)) {
      for (const v of findViolations(readFileSync(file, "utf8"), loc.code)) {
        total++;
        console.warn(`translate:check [${loc.code}] forbidden term "${v.found}" (${v.term}) in ${file.replace(WEB + "/", "")}`);
      }
    }
  }
  if (total) console.warn(`translate:check: ${total} glossary violation(s) — see web/i18n/README.md to hand-fix. (non-fatal; npm test fails on these)`);
  return total;
}

async function runCheck() {
  const sources = loadSources();
  const structured = loadStructured();
  const current = currentManifest(sources, structured, loadUiSource());
  let totalStale = 0;
  for (const loc of TARGET_LOCALES) {
    const stored = readJson(resolve(I18N, loc.code, "_translation-manifest.json")) ?? {};
    const stale = diffManifest(current, expandStoredProse(stored, sources));
    if (stale.length) {
      totalStale += stale.length;
      console.warn(`translate:check [${loc.code}] ${stale.length} stale/missing unit(s): ${stale.join(", ")}`);
    }
  }
  if (totalStale === 0) console.log("translate:check: all locales up to date");
  else console.warn(`translate:check: ${totalStale} stale unit(s). Run "pnpm translate" to refresh. (non-fatal)`);
  const violations = runGlossaryScan();
  if (process.argv.includes("--strict") && (totalStale > 0 || violations > 0)) process.exit(1);
}

// Concurrent in-flight API requests per phase. The pool is per-locale and the
// first request of each (locale, mode) phase runs alone — it writes the prompt-
// cache entry the rest then read; firing everything cold would forfeit the
// cache (and its cost/latency win) on every request of the batch.
const CONCURRENCY = Math.max(1, parseInt(process.env.TRANSLATE_CONCURRENCY ?? "4", 10) || 4);

/** Translate every string in `texts` (Set/array), CONCURRENCY at a time after a
 * cache-warming first call. Returns Map(source -> translation). */
async function pooledTranslate(texts, translate, log) {
  const list = [...texts];
  const tmap = new Map();
  if (!list.length) return tmap;
  log(list[0]);
  tmap.set(list[0], await translate(list[0]));
  const rest = list.slice(1);
  let next = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, rest.length) }, async () => {
    while (next < rest.length) {
      const s = rest[next++];
      log(s);
      tmap.set(s, await translate(s));
    }
  });
  await Promise.all(workers);
  return tmap;
}

const oneLine = (s, n = 40) => `${s.slice(0, n).replace(/\n/g, "⏎")}${s.length > n ? "…" : ""}`;

async function runSeed() {
  const { makeTranslator } = await import("../lib/translate-anthropic.mjs");
  const sources = loadSources();
  const structured = loadStructured();
  const enUi = loadUiSource();
  for (const loc of TARGET_LOCALES) {
    const base = resolve(I18N, loc.code);
    const stored = readJson(resolve(base, "_translation-manifest.json")) ?? {};
    const prev = {};
    for (const name of PROSE_DOCS) {
      const p = readIfExists(resolve(base, "content", name));
      if (p != null) prev[name] = p;
    }
    // Prose sections translate with document context; table/graph cells are
    // standalone short values and need the fragment-aware prompt; UI strings
    // get the token-preserving prompt (see translate-anthropic).
    const translateDoc = makeTranslator(loc.code, "document");
    const translateCell = makeTranslator(loc.code, "fragment");
    const translateUi = makeTranslator(loc.code, "ui");
    const manifest = {};

    // Every group runs the same three phases: (1) a recording pass discovers
    // which source strings are stale, (2) the pool translates each once,
    // (3) a lookup pass re-runs the pure seeder with the results and writes.

    // Prose, per `## `-section block.
    const proseNeeded = new Set();
    seedProse(sources, stored, (s) => { proseNeeded.add(s); return s; }, prev);
    const proseMap = await pooledTranslate(proseNeeded, translateDoc,
      (s) => console.log(`translate [${loc.code}] prose: "${oneLine(s)}"`));
    const prose = seedProse(sources, stored, (s) => proseMap.get(s) ?? s, prev);
    for (const [name, body] of Object.entries(prose.files)) writeOut(resolve(base, "content", name), body);
    Object.assign(manifest, prose.manifest);

    // Structured data (timeline, graph, sectioned tables).
    const prevStruct = {
      timeline: readJson(resolve(base, "data", "timeline.json")),
      relationships: readJson(resolve(base, "data", "relationships.json")),
      sectioned: Object.fromEntries(SECTIONED_FILES.map((f) => [f, readJson(resolve(base, "data", f))])),
    };
    const needed = new Set();
    runStructured(structured, stored, prevStruct, (s) => { needed.add(s); return s; });
    const tmap = await pooledTranslate(needed, translateCell,
      (s) => console.log(`translate [${loc.code}] structured: "${oneLine(s)}"`));
    const { writes, manifest: sm } = runStructured(structured, stored, prevStruct, (s) => tmap.get(s) ?? s);
    for (const [name, obj] of Object.entries(writes)) {
      writeOut(resolve(base, "data", name), JSON.stringify(obj, null, 2) + "\n");
    }
    Object.assign(manifest, sm);
    console.log(`translate [${loc.code}]: ${needed.size} structured unit(s) translated`);

    // UI dictionary: i18n/ui/en.json -> i18n/ui/<code>.json.
    const prevUi = readJson(resolve(I18N, "ui", `${loc.code}.json`)) ?? {};
    const uiNeeded = new Set();
    seedUiDict(enUi, stored, (s) => { uiNeeded.add(s); return s; }, prevUi);
    const uiMap = await pooledTranslate(uiNeeded, translateUi,
      (s) => console.log(`translate [${loc.code}] ui: "${oneLine(s)}"`));
    const ui = seedUiDict(enUi, stored, (s) => uiMap.get(s) ?? s, prevUi);
    writeOut(resolve(I18N, "ui", `${loc.code}.json`), JSON.stringify(ui.dict, null, 2) + "\n");
    Object.assign(manifest, ui.manifest);
    console.log(`translate [${loc.code}]: ${uiNeeded.size} ui string(s) translated, ${Object.keys(enUi).length - uiNeeded.size} reused`);

    writeOut(resolve(base, "_translation-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
    console.log(`translate [${loc.code}]: ${prose.stale.length} prose section(s) refreshed, concurrency=${CONCURRENCY}`);
  }
}

const reuseOr = (key, stored, h, prevVal, translate, src) =>
  (stored[key] === h && prevVal != null) ? prevVal : translate(src);

export function extractSectioned(file, canonical, stored, translate, prev = null) {
  const manifest = {};
  const sections = canonical.sections.map((s, si) => {
    // The section heading is a visible display string (e.g. "The collection owners").
    let heading = s.heading;
    if (s.heading) {
      const headKey = `head:${file}:${si}`;
      manifest[headKey] = hashProse(s.heading);
      heading = reuseOr(headKey, stored, manifest[headKey], prev?.sections?.[si]?.heading, translate, s.heading);
    }
    const colKey = `cols:${file}:${si}`;
    manifest[colKey] = hashColumns(s.columns);
    // ci indexes the positionally-corresponding prior value; drift is keyed at the
    // whole-column-group / whole-row level (one hash per group), not per cell.
    const pCols = prev?.sections?.[si]?.columns ?? null;
    const columns = s.columns.map((c, ci) =>
      reuseOr(colKey, stored, manifest[colKey], pCols?.[ci], translate, c));
    const rows = s.rows.map((r, ri) => {
      const rowKey = `row:${file}:${si}:${ri}`;
      manifest[rowKey] = hashRow(r.cells);
      const pCells = prev?.sections?.[si]?.rows?.[ri]?.cells ?? null;
      const cells = r.cells.map((cell, ci) =>
        reuseOr(rowKey, stored, manifest[rowKey], pCells?.[ci], translate, cell));
      return { cells, plain: cells.join(" • ") };
    });
    return { heading, columns, rows };
  });
  return { translated: { sections }, manifest };
}

export function extractTimeline(canonical, stored, translate, prev = null) {
  const file = "timeline.json";
  const manifest = {};
  const colKey = `cols:${file}:0`;
  manifest[colKey] = hashColumns(canonical.columns);
  const columns = canonical.columns.map((c, ci) =>
    reuseOr(colKey, stored, manifest[colKey], prev?.columns?.[ci], translate, c));
  const rows = canonical.rows.map((r, ri) => {
    const rowKey = `row:${file}:0:${ri}`;
    manifest[rowKey] = hashRow(r.cells);
    const pCells = prev?.rows?.[ri]?.cells ?? null;
    const cells = r.cells.map((cell, ci) =>
      reuseOr(rowKey, stored, manifest[rowKey], pCells?.[ci], translate, cell));
    return { cells, plain: cells.join(" • ") };
  });
  return { translated: { columns, rows }, manifest };
}

export function extractGraph(canonical, stored, translate, prev = null) {
  const manifest = {};
  const prevNodes = new Map((prev?.nodes ?? []).map((n) => [n.id, n]));
  const nodes = canonical.nodes.map((n) => {
    const key = `node:${n.id}`;
    manifest[key] = hashNode(n);
    const p = prevNodes.get(n.id);
    const out = { id: n.id, label: reuseOr(key, stored, manifest[key], p?.label, translate, n.label) };
    if (n.role) out.role = reuseOr(key, stored, manifest[key], p?.role, translate, n.role);
    if (n.statement) out.statement = reuseOr(key, stored, manifest[key], p?.statement, translate, n.statement);
    return out;
  });
  const edges = canonical.edges.map((e, i) => {
    const key = `edge:${i}`;
    manifest[key] = hashEdge(e);
    const p = prev?.edges?.[i] ?? null;
    const out = { label: reuseOr(key, stored, manifest[key], p?.label, translate, e.label) };
    if (e.note) out.note = reuseOr(key, stored, manifest[key], p?.note, translate, e.note);
    return out;
  });
  return { translated: { nodes, edges }, manifest };
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  (process.argv.includes("--check") ? runCheck() : runSeed()).catch((e) => {
    console.error(e); process.exit(1);
  });
}
