import assert from "node:assert/strict";
import { LOCALES, DEFAULT_LOCALE, TARGET_LOCALES, isLocale, getLocale } from "../lib/locales.mjs";

assert.equal(DEFAULT_LOCALE, "en", "default locale is en");
assert.ok(LOCALES.some((l) => l.code === "zh-Hans"), "zh-Hans registered");
assert.equal(TARGET_LOCALES.find((l) => l.code === "en"), undefined, "en is not a target");
assert.equal(getLocale("zh-Hans").endonym, "简体中文", "endonym present");
assert.equal(getLocale("zh-Hans").isCJK, true, "zh-Hans flagged CJK");
assert.equal(isLocale("en"), true, "en is a valid locale");
assert.equal(isLocale("xx"), false, "unknown code is not a valid locale");
console.log("locales: registry assertions passed");

import {
  sha256, hashProse, hashRow, hashColumns, hashNode, hashEdge, diffManifest,
} from "./translate.mjs";

assert.equal(sha256("abc"), sha256("abc"), "sha256 stable");
assert.notEqual(sha256("abc"), sha256("abd"), "sha256 sensitive");
assert.equal(hashRow(["a", "b"]), hashRow(["a", "b"]), "row hash stable");
assert.notEqual(hashRow(["a", "b"]), hashRow(["a", "c"]), "row hash sensitive");
assert.notEqual(hashRow(["ab", ""]), hashRow(["a", "b"]), "field-boundary collision avoided");
assert.equal(hashNode({ label: "X" }), hashNode({ label: "X", role: "", statement: "" }), "node hash treats missing as empty");
assert.equal(hashProse("# Title"), sha256("# Title"), "hashProse is sha256 of the document");
assert.notEqual(hashColumns(["Date", "Event"]), hashColumns(["Event", "Date"]), "column order is significant");
assert.notEqual(hashEdge({ label: "ab" }), hashEdge({ label: "a", note: "b" }), "edge field-boundary collision avoided");

// diffManifest: which unit keys are stale/missing vs a stored manifest.
{
  const current = { "prose:home": "h1", "row:timeline:0": "r1" };
  const stored = { "prose:home": "h1", "row:timeline:0": "OLD" };
  const stale = diffManifest(current, stored);
  assert.deepEqual(stale.sort(), ["row:timeline:0"], "only changed unit is stale");
}
{
  const stale = diffManifest({ "prose:home": "h1" }, {});
  assert.deepEqual(stale, ["prose:home"], "missing unit is stale");
}
console.log("translate: hashing + diff assertions passed");

import { seedProse, splitProse, expandStoredProse, PROSE_DOCS } from "./translate.mjs";

// splitProse: lossless `## `-section blocks.
{
  const doc = "Intro line.\n\n## One\na\n\n## Two\nb\n";
  const blocks = splitProse(doc);
  assert.equal(blocks.length, 3, "preamble + two sections");
  assert.equal(blocks.join(""), doc, "split is lossless");
  assert.ok(blocks[1].startsWith("## One"), "block starts at its heading");
  assert.deepEqual(splitProse("no headings at all"), ["no headings at all"], "headingless doc = one block");
  const headFirst = "## A\nx\n## B\ny";
  assert.equal(splitProse(headFirst).join(""), headFirst, "doc starting with ## stays lossless");
  assert.equal(splitProse(headFirst).length, 2, "no empty leading block");
  assert.equal(splitProse("text with ## inline\nnot a heading").length, 1, "mid-line ## is not a heading");
}

{
  const sources = { "home.md": "Intro.\n\n## A\nHello CONFIRMED.\n\n## B\nBye.\n", "police.md": "World." };
  const fake = (text) => `[zh]${text}`;

  // Cold: nothing stored -> every block translated.
  const cold = seedProse(sources, {}, fake);
  assert.equal(cold.files["home.md"], "[zh]Intro.\n\n[zh]## A\nHello CONFIRMED.\n\n[zh]## B\nBye.\n", "translates per block");
  assert.equal(cold.manifest["prose:home.md#1"], hashProse("## A\nHello CONFIRMED.\n\n"), "records per-block hash");
  assert.deepEqual(cold.stale.sort(), ["prose:home.md#0", "prose:home.md#1", "prose:home.md#2", "prose:police.md#0"], "cold = all blocks stale");

  // Warm: only section B changed -> A (with a human fix) survives, B re-translates.
  // A realistic prior translation keeps the `## ` headings, so it splits into
  // the same number of blocks as the English source.
  const prevHome = "简介。\n\n## A 部分\n人工修正的A段\n\n## B 部分\n再见。\n";
  const stored = { ...cold.manifest };
  const edited = { ...sources, "home.md": "Intro.\n\n## A\nHello CONFIRMED.\n\n## B\nChanged.\n" };
  const warm = seedProse(edited, stored, fake, { "home.md": prevHome, "police.md": "[zh]World." });
  assert.equal(warm.files["home.md"], "简介。\n\n## A 部分\n人工修正的A段\n\n[zh]## B\nChanged.\n", "unchanged blocks keep prior (human) translation; only edited block re-translates");
  assert.deepEqual(warm.stale, ["prose:home.md#2"], "only the edited block is stale");

  // Migration: an old whole-file manifest key vouches for all blocks (zero API).
  const legacy = { "prose:home.md": hashProse(sources["home.md"]) };
  const mig = seedProse({ "home.md": sources["home.md"] }, legacy, () => { throw new Error("must not translate"); }, { "home.md": prevHome });
  assert.equal(mig.files["home.md"], prevHome, "whole-file match reuses committed translation per block");
  assert.deepEqual(mig.stale, [], "migration is zero-cost");
  assert.ok(mig.manifest["prose:home.md#0"], "migration emits per-block keys");
  const expanded = expandStoredProse(legacy, { "home.md": sources["home.md"] });
  assert.equal(expanded["prose:home.md#2"], hashProse("## B\nBye.\n"), "expandStoredProse synthesizes block hashes");

  // Misaligned prev (section count differs) -> positional reuse refused, re-translate.
  const misStored = { ...cold.manifest };
  const mis = seedProse({ "home.md": sources["home.md"] }, misStored, fake, { "home.md": "[zh]only one block, no sections" });
  assert.equal(mis.stale.length, 3, "misaligned prior translation re-translates all blocks");
}
assert.ok(PROSE_DOCS.includes("home.md"), "home.md is a known prose doc");
console.log("translate: prose seeding assertions passed");

import { seedUiDict } from "./translate.mjs";

{
  const en = { "nav.timeline": "Timeline", "timeline.count": "{shown} of {total} events" };
  const fake = (t) => `[zh]${t}`;

  // Cold: nothing stored -> all translated.
  const cold = seedUiDict(en, {}, fake);
  assert.equal(cold.dict["nav.timeline"], "[zh]Timeline", "translates ui string");
  assert.equal(cold.manifest["ui:nav.timeline"], hashProse("Timeline"), "records ui:<key> hash");
  assert.deepEqual(cold.stale.sort(), ["ui:nav.timeline", "ui:timeline.count"], "cold = all stale");

  // Warm: nav unchanged (reuse human translation), count changed (re-translate).
  const stored = { "ui:nav.timeline": hashProse("Timeline"), "ui:timeline.count": hashProse("OLD") };
  const prev = { "nav.timeline": "时间线", "timeline.count": "[zh]OLD" };
  const warm = seedUiDict(en, stored, fake, prev);
  assert.equal(warm.dict["nav.timeline"], "时间线", "unchanged ui keeps prior (human) translation");
  assert.equal(warm.dict["timeline.count"], "[zh]{shown} of {total} events", "changed ui re-translated");
  assert.deepEqual(warm.stale, ["ui:timeline.count"], "only changed ui stale");
}
console.log("translate: ui dict seeding assertions passed");

import { extractSectioned, extractTimeline, extractGraph } from "./translate.mjs";

{
  const canonical = {
    sections: [{
      heading: "H", columns: ["Date", "Event"],
      rows: [
        { cells: ["Nov 22, 2023", "Consigned **collection**"], plain: "x", status: undefined },
        { cells: ["Late 2024", "Repossessed"], plain: "y" },
      ],
    }],
  };
  const fake = (t) => `Z<${t}>`;
  const { translated, manifest } = extractSectioned("parties.json", canonical, {}, fake);
  assert.equal(translated.sections[0].heading, "Z<H>", "section heading translated");
  assert.equal(translated.sections[0].columns[0], "Z<Date>", "columns translated");
  assert.equal(translated.sections[0].rows[0].cells[1], "Z<Consigned **collection**>", "cell translated");
  assert.equal(translated.sections[0].rows[0].plain, "Z<Nov 22, 2023> • Z<Consigned **collection**>", "plain recomputed from translated cells");
  assert.ok(manifest["head:parties.json:0"], "heading hash recorded");
  assert.ok(manifest["row:parties.json:0:0"], "row hash recorded");
  assert.ok(manifest["cols:parties.json:0"], "columns hash recorded");
}

{
  const tl = {
    columns: ["Date", "Event"], statusIdx: -1,
    rows: [{ cells: ["Nov 22, 2023", "Consigned"], plain: "p", status: "confirmed", sort: { y: 2023, m: 11, d: 22 }, order: 0 }],
  };
  const { translated, manifest } = extractTimeline(tl, {}, (t) => `Z<${t}>`);
  assert.equal(translated.columns[1], "Z<Event>", "timeline column translated");
  assert.equal(translated.rows[0].cells[0], "Z<Nov 22, 2023>", "timeline cell translated");
  assert.equal(translated.rows[0].plain, "Z<Nov 22, 2023> • Z<Consigned>", "timeline plain recomputed");
  assert.ok(manifest["row:timeline.json:0:0"], "timeline row hash recorded");
  assert.equal(translated.rows[0].status, undefined, "timeline status NOT in translation file");
}

{
  const graph = {
    nodes: [{ id: "ben", label: "Reckless Ben", type: "person", side: "defendant", ini: "RB", role: "YouTuber", statement: "q" }],
    edges: [{ source: "ben", target: "ben", label: "self", category: "corporate", direction: "none", status: "CONFIRMED", note: "n" }],
  };
  const fake = (t) => `Z<${t}>`;
  const { translated } = extractGraph(graph, {}, fake);
  assert.equal(translated.nodes[0].label, "Z<Reckless Ben>", "node label translated");
  assert.equal(translated.nodes[0].role, "Z<YouTuber>", "node role translated");
  assert.equal(translated.edges[0].label, "Z<self>", "edge label translated");
  assert.equal(translated.edges[0].note, "Z<n>", "edge note translated");
  // No canonical fields leak into the translation file:
  assert.equal(translated.nodes[0].type, undefined, "node type NOT in translation file");
  assert.equal(translated.edges[0].category, undefined, "edge category NOT in translation file");
}
console.log("translate: structured extraction assertions passed");
