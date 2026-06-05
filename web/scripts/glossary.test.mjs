import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { PROTECTED_TERMS, glossaryPromptBlock, findViolations } from "../lib/glossary.mjs";
import { TARGET_LOCALES } from "../lib/locales.mjs";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const i18n = join(webRoot, "i18n");

// --- unit: prompt block reflects the glossary ---
{
  const block = glossaryPromptBlock("zh-Hant");
  assert.ok(block.includes("American Fork"), "prompt block names American Fork");
  assert.ok(block.includes("AFPD"), "prompt block names AFPD");
  assert.ok(block.includes("美國福克"), "prompt block lists the zh-Hant forbidden form for American Fork");
  assert.ok(/CONFIRMED/.test(block) && /ALLEGATION/.test(block), "prompt block carries the status-token rule");
  // es has no Chinese forbid lists, but the instructions still apply.
  const esBlock = glossaryPromptBlock("es");
  assert.ok(esBlock.includes("American Fork") && esBlock.includes("AFPD"), "es prompt block carries the terms");
  assert.ok(!esBlock.includes("美國福克"), "es block omits zh-only forbidden forms");
}

// --- unit: findViolations catches bad output and passes clean output ---
{
  assert.deepEqual(
    findViolations("YouTuber 遭美國福克警方逮捕", "zh-Hant").map((v) => v.found),
    ["美國福克"],
    "detects transliterated American Fork (zh-Hant)",
  );
  assert.deepEqual(findViolations("遭 American Fork 警方逮捕", "zh-Hant"), [], "Latin American Fork is clean");
  assert.ok(
    findViolations("空军部队警察局侦探", "zh-Hans").some((v) => v.found === "空军"),
    "detects AFPD-as-Air-Force (zh-Hans)",
  );
  assert.deepEqual(findViolations("AFPD侦探", "zh-Hans"), [], "AFPD acronym is clean");
  assert.ok(findViolations("（百思買）", "zh-Hant").some((v) => v.found === "百思買"), "detects Best Buy mistranslation");
  assert.deepEqual(findViolations("anything at all", "es"), [], "es has no Chinese forbid terms");
}

// --- integration: NO committed translation may contain a forbidden rendering ---
function localeFiles(code) {
  const files = [];
  const dataDir = join(i18n, code, "data");
  if (existsSync(dataDir)) for (const f of readdirSync(dataDir)) if (f.endsWith(".json")) files.push(join(dataDir, f));
  const contentDir = join(i18n, code, "content");
  if (existsSync(contentDir)) for (const f of readdirSync(contentDir)) files.push(join(contentDir, f));
  const uiDict = join(i18n, "ui", `${code}.json`);
  if (existsSync(uiDict)) files.push(uiDict);
  return files;
}

const offenders = [];
for (const loc of TARGET_LOCALES) {
  for (const file of localeFiles(loc.code)) {
    const hits = findViolations(readFileSync(file, "utf8"), loc.code);
    for (const h of hits) offenders.push(`${file.replace(webRoot + "/", "")}: ${h.found} (${h.term})`);
  }
}
assert.deepEqual(
  offenders,
  [],
  `committed translations contain forbidden term(s) — re-seed mistranslation, hand-fix per web/i18n/README.md:\n  ${offenders.join("\n  ")}`,
);

assert.ok(PROTECTED_TERMS.length >= 4, "glossary is non-trivial");
console.log(`glossary: prompt + detector assertions passed; ${TARGET_LOCALES.length} locale(s) clean of forbidden terms`);
