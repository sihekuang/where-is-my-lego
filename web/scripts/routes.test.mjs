// Drift guard: lib/routes.mjs ROUTE_PATHS must exactly match the real app/[locale] page routes.
// If someone adds/removes a page, this fails until ROUTE_PATHS is updated — which is what the
// middleware reads to decide which locale-less / wrong-locale URLs to redirect (vs 404).
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { ROUTE_PATHS } from "../lib/routes.mjs";

const ROOT = resolve(process.cwd(), "app/[locale]");

/** Every "/sub/path" under app/[locale] that holds a page.tsx (the home page at the root is excluded). */
function discover(dir, prefix = "") {
  const found = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const childDir = resolve(dir, ent.name);
    const path = `${prefix}/${ent.name}`;
    if (readdirSync(childDir).includes("page.tsx")) found.push(path);
    found.push(...discover(childDir, path));
  }
  return found;
}

const actual = discover(ROOT).sort();
const declared = [...ROUTE_PATHS].sort();
assert.deepEqual(declared, actual, "ROUTE_PATHS must match the app/[locale] page routes exactly");

console.log(`routes: ${ROUTE_PATHS.length} route paths match app/[locale] pages`);
