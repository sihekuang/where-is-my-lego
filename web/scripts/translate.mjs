// translate.mjs — build-time translation pipeline. Pure transforms + an
// injectable translator; the real Anthropic call is lazy-imported so tests and
// --check never need the SDK or an API key.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TARGET_LOCALES } from "../lib/locales.mjs";

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
  "home.md", "disclaimer.md", "lawsuit.md", "lawsuit-documents.md", "police.md", "media-manifest.md",
  "community-sources.md",
];

/**
 * Pure prose seeding. For each doc: if its source hash matches the stored
 * manifest, reuse the prior translation (preserving human edits); otherwise
 * call `translate`. Returns translated files + the fresh manifest + stale keys.
 */
export function seedProse(sources, stored, translate, prev = {}) {
  const files = {};
  const manifest = {};
  const stale = [];
  for (const [name, src] of Object.entries(sources)) {
    const key = `prose:${name}`;
    const h = hashProse(src);
    manifest[key] = h;
    if (stored[key] === h && prev[name] != null) {
      files[name] = prev[name]; // unchanged -> keep prior (possibly human-corrected)
    } else {
      files[name] = translate(src);
      stale.push(key);
    }
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
  for (const [name, src] of Object.entries(sources)) m[`prose:${name}`] = hashProse(src);
  Object.assign(m, structuredManifest(structured));
  Object.assign(m, uiManifest(uiSource));
  return m;
}

async function runCheck() {
  const sources = loadSources();
  const structured = loadStructured();
  const current = currentManifest(sources, structured, loadUiSource());
  let totalStale = 0;
  for (const loc of TARGET_LOCALES) {
    const stored = readJson(resolve(I18N, loc.code, "_translation-manifest.json")) ?? {};
    const stale = diffManifest(current, stored);
    if (stale.length) {
      totalStale += stale.length;
      console.warn(`translate:check [${loc.code}] ${stale.length} stale/missing unit(s): ${stale.join(", ")}`);
    }
  }
  if (totalStale === 0) console.log("translate:check: all locales up to date");
  else console.warn(`translate:check: ${totalStale} stale unit(s). Run "pnpm translate" to refresh. (non-fatal)`);
  if (process.argv.includes("--strict") && totalStale > 0) process.exit(1);
}

async function runSeed() {
  const { makeTranslator } = await import("../lib/translate-anthropic.mjs");
  const sources = loadSources();
  for (const loc of TARGET_LOCALES) {
    const base = resolve(I18N, loc.code);
    const stored = readJson(resolve(base, "_translation-manifest.json")) ?? {};
    const prev = {};
    for (const name of PROSE_DOCS) {
      const p = readIfExists(resolve(base, "content", name));
      if (p != null) prev[name] = p;
    }
    // Prose docs translate with full document context; table/graph cells are
    // standalone short values and need the fragment-aware prompt (see translate-anthropic).
    const translateDoc = makeTranslator(loc.code, "document");
    const translateCell = makeTranslator(loc.code, "fragment");
    // seedProse is sync over an async translate; resolve sequentially to respect rate limits.
    const out = { files: {}, manifest: {}, stale: [] };
    for (const [name, src] of Object.entries(sources)) {
      const key = `prose:${name}`;
      const h = hashProse(src);
      out.manifest[key] = h;
      if (stored[key] === h && prev[name] != null) {
        out.files[name] = prev[name];
      } else {
        console.log(`translate [${loc.code}] ${name} …`);
        out.files[name] = await translateDoc(src);
        out.stale.push(key);
      }
    }
    for (const [name, body] of Object.entries(out.files)) writeOut(resolve(base, "content", name), body);
    // Structured data: extractors are sync, real translator is async -> pre-translate.
    const structured = loadStructured();
    const prevStruct = {
      timeline: readJson(resolve(base, "data", "timeline.json")),
      relationships: readJson(resolve(base, "data", "relationships.json")),
      sectioned: Object.fromEntries(SECTIONED_FILES.map((f) => [f, readJson(resolve(base, "data", f))])),
    };
    // Phase 1: discover the stale source strings (recording sync translator).
    const needed = new Set();
    runStructured(structured, stored, prevStruct, (s) => { needed.add(s); return s; });
    // Phase 2: translate each once, sequentially (rate-limit friendly).
    const tmap = new Map();
    for (const s of needed) {
      console.log(`translate [${loc.code}] structured: "${s.slice(0, 40)}${s.length > 40 ? "…" : ""}"`);
      tmap.set(s, await translateCell(s));
    }
    // Phase 3: re-run with a sync lookup translator, then write.
    const { writes, manifest: sm } = runStructured(structured, stored, prevStruct, (s) => tmap.get(s) ?? s);
    for (const [name, obj] of Object.entries(writes)) {
      writeOut(resolve(base, "data", name), JSON.stringify(obj, null, 2) + "\n");
    }
    Object.assign(out.manifest, sm);
    console.log(`translate [${loc.code}]: ${needed.size} structured unit(s) translated`);

    // UI dictionary: translate i18n/ui/en.json -> i18n/ui/<code>.json (drift-tracked,
    // hardened "ui" prompt preserves {tokens}, **bold**, CONFIRMED/ALLEGATION, arrows).
    const enUi = loadUiSource();
    const prevUi = readJson(resolve(I18N, "ui", `${loc.code}.json`)) ?? {};
    const translateUi = makeTranslator(loc.code, "ui");
    const uiDict = {};
    let uiTranslated = 0;
    for (const [k, v] of Object.entries(enUi)) {
      const mkey = `ui:${k}`;
      const h = hashProse(v);
      out.manifest[mkey] = h;
      if (stored[mkey] === h && prevUi[k] != null) {
        uiDict[k] = prevUi[k];
      } else {
        console.log(`translate [${loc.code}] ui:${k} …`);
        uiDict[k] = await translateUi(v);
        uiTranslated++;
      }
    }
    writeOut(resolve(I18N, "ui", `${loc.code}.json`), JSON.stringify(uiDict, null, 2) + "\n");
    console.log(`translate [${loc.code}]: ${uiTranslated} ui string(s) translated, ${Object.keys(enUi).length - uiTranslated} reused`);

    writeOut(resolve(base, "_translation-manifest.json"), JSON.stringify(out.manifest, null, 2) + "\n");
    console.log(`translate [${loc.code}]: ${out.stale.length} prose unit(s) refreshed, ${PROSE_DOCS.length - out.stale.length} reused`);
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
