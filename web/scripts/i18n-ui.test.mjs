import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TARGET_LOCALES } from "../lib/locales.mjs";

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../i18n/ui");
const en = JSON.parse(readFileSync(resolve(DIR, "en.json"), "utf8"));
const enKeys = Object.keys(en).sort();

// The English source is the fallback for every locale, so its values must be non-empty.
for (const k of enKeys) assert.ok(en[k]?.trim(), `en key "${k}" is non-empty`);

// Markup that MUST survive translation verbatim (the overlay + Rich helper depend on it).
const placeholders = (s) => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort();
const boldMarkers = (s) => (s.match(/\*\*/g) ?? []).length;
const LITERALS = ["CONFIRMED", "ALLEGATION"];

for (const loc of TARGET_LOCALES) {
  const d = JSON.parse(readFileSync(resolve(DIR, `${loc.code}.json`), "utf8"));
  assert.deepEqual(Object.keys(d).sort(), enKeys, `${loc.code} UI dict has exactly the en keys`);
  for (const k of enKeys) {
    assert.ok(d[k]?.trim(), `${loc.code} key "${k}" is non-empty`);
    // Interpolation tokens ({download}, {shown}, …) must match exactly — render code splits on them.
    assert.deepEqual(placeholders(d[k]), placeholders(en[k]), `${loc.code} "${k}" preserves {tokens}`);
    // ** emphasis pairs must be preserved (the Rich helper bolds between them).
    assert.equal(boldMarkers(d[k]), boldMarkers(en[k]), `${loc.code} "${k}" preserves ** marker count`);
    // Status literals stay as uppercase Latin tokens even when glossed.
    for (const lit of LITERALS) {
      if (en[k].includes(lit)) assert.ok(d[k].includes(lit), `${loc.code} "${k}" keeps literal ${lit}`);
    }
  }
}
console.log(`i18n-ui: ${TARGET_LOCALES.length} locale dict(s) match en key set + markup parity`);
