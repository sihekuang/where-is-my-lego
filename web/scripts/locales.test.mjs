import assert from "node:assert/strict";
import { negotiateLocale, DEFAULT_LOCALE, isLocale, LOCALE_CODES } from "../lib/locales.mjs";

// --- Exact + region/script collapse -----------------------------------------
const cases = [
  // [Accept-Language, expected locale]
  ["en", "en"],
  ["en-US,en;q=0.9", "en"],
  ["en-GB", "en"],
  ["es", "es"],
  ["es-MX,es;q=0.8", "es"],
  ["es-419", "es"],
  // Chinese splits by script, not language.
  ["zh", "zh-Hans"],
  ["zh-CN", "zh-Hans"],
  ["zh-SG", "zh-Hans"],
  ["zh-Hans", "zh-Hans"],
  ["zh-Hans-CN", "zh-Hans"],
  ["zh-TW", "zh-Hant"],
  ["zh-HK", "zh-Hant"],
  ["zh-MO", "zh-Hant"],
  ["zh-Hant", "zh-Hant"],
  ["zh-Hant-HK", "zh-Hant"],
];
for (const [header, expected] of cases) {
  assert.equal(negotiateLocale(header), expected, `"${header}" -> ${expected}`);
}

// --- q-weight ordering wins over header position -----------------------------
// French (unsupported) is first but lower weight; Spanish should win.
assert.equal(negotiateLocale("fr;q=0.9,es;q=1.0"), "es", "higher q wins over position");
assert.equal(negotiateLocale("de-DE,zh-TW;q=0.7,en;q=0.3"), "zh-Hant", "skips unsupported, takes best supported");

// q=0 means "not acceptable" and must be ignored.
assert.equal(negotiateLocale("es;q=0,en"), "en", "q=0 range is dropped");

// --- Fallbacks ---------------------------------------------------------------
assert.equal(negotiateLocale(""), DEFAULT_LOCALE, "empty header -> default");
assert.equal(negotiateLocale(null), DEFAULT_LOCALE, "null header -> default");
assert.equal(negotiateLocale(undefined), DEFAULT_LOCALE, "undefined header -> default");
assert.equal(negotiateLocale("fr-FR,de;q=0.8,ja"), DEFAULT_LOCALE, "no supported match -> default");
assert.equal(negotiateLocale("*"), DEFAULT_LOCALE, "wildcard-only -> default");

// --- Output is always a real, routable locale --------------------------------
for (const [header] of cases) {
  const out = negotiateLocale(header);
  assert.ok(isLocale(out) && LOCALE_CODES.includes(out), `${header} negotiates to a valid locale`);
}

console.log(`locales: ${cases.length} negotiation cases + q-weight, fallback, validity checks pass`);
