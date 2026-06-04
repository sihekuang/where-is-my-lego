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
