// translate.mjs — build-time translation pipeline. Pure transforms + an
// injectable translator; the real Anthropic call is lazy-imported so tests and
// --check never need the SDK or an API key.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
