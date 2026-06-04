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

import { seedProse, PROSE_DOCS } from "./translate.mjs";

{
  const sources = { "home.md": "Hello CONFIRMED.", "police.md": "World." };
  const fake = (text) => `[zh]${text}`;

  // Cold: nothing stored -> both translated.
  const cold = seedProse(sources, {}, fake);
  assert.equal(cold.files["home.md"], "[zh]Hello CONFIRMED.", "translates prose");
  assert.equal(cold.manifest["prose:home.md"], hashProse("Hello CONFIRMED."), "records source hash");
  assert.deepEqual(cold.stale.sort(), ["prose:home.md", "prose:police.md"], "cold = all stale");

  // Warm: home unchanged, police changed -> only police re-translated, home reused.
  const stored = { "prose:home.md": hashProse("Hello CONFIRMED."), "prose:police.md": hashProse("OLD") };
  const prev = { "home.md": "保留的人工翻译", "police.md": "[zh]OLD" };
  const warm = seedProse(sources, stored, fake, prev);
  assert.equal(warm.files["home.md"], "保留的人工翻译", "unchanged prose keeps prior (human) translation");
  assert.equal(warm.files["police.md"], "[zh]World.", "changed prose is re-translated");
  assert.deepEqual(warm.stale, ["prose:police.md"], "only changed unit stale");
}
assert.ok(PROSE_DOCS.includes("home.md"), "home.md is a known prose doc");
console.log("translate: prose seeding assertions passed");
