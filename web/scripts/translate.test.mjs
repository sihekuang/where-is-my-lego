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
