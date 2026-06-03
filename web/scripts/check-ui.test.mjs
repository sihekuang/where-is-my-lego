import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert";

const root = new URL("..", import.meta.url).pathname;
const css = readFileSync(join(root, "app/globals.css"), "utf8");

// (a) brick tokens present
for (const tok of ["--confirmed","--allegation","--reported","--brick-blue","--brick-red","--background","--foreground","--stud-grid"]) {
  assert.ok(css.includes(tok), `globals.css missing token ${tok}`);
}

// (b) dead legacy selectors gone from globals.css (NOTE: .prose is intentionally NOT here — it is re-added later)
for (const sel of [".site-header",".graph-canvas {",".event {",".detail-card",".chip {",".data-section"]) {
  assert.ok(!css.includes(sel), `globals.css still defines legacy selector ${sel}`);
}

// (c) no source .tsx/.ts references the removed legacy classNames
const LEGACY = ["site-header","header-inner","brand-logo","brand-text","brand-sub","graph-card","graph-toolbar","graph-stage","graph-canvas","graph-legend","graph-prov","detail-card","detail-avatar","detail-side","detail-role","detail-stmt","detail-jump","detail-x","event-head","event-date","event-body","event-source","result-count","data-section","table-wrap","page-title","page-intro","site-footer","sort-toggle","label-toggle"];
function walk(dir) {
  let out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!["node_modules",".next",".generated","ui"].includes(name)) out = out.concat(walk(p)); }
    else if (/\.(tsx|ts)$/.test(name)) out.push(p);
  }
  return out;
}
const offenders = [];
for (const f of [...walk(join(root,"app")), ...walk(join(root,"components"))]) {
  const txt = readFileSync(f, "utf8");
  for (const cls of LEGACY) {
    if (new RegExp(`className=\\{?["\\\`][^"\\\`]*\\b${cls}\\b`).test(txt)) offenders.push(`${f.replace(root,"")}: ${cls}`);
  }
}
assert.strictEqual(offenders.length, 0, `legacy classNames still in source:\n${offenders.join("\n")}`);

// (d) graph revamp — style module exports
const graphStyle = readFileSync(join(root, "lib/graph-style.ts"), "utf8");
for (const s of ["export const SIDE_PALETTE", "export const GLOW_PARAMS", "export function nodeSize", "export function withAlpha"]) {
  assert.ok(graphStyle.includes(s), `graph-style.ts missing ${s}`);
}
// (e) graph revamp — canvas wiring
const graphCanvas = readFileSync(join(root, "components/GraphCanvas.tsx"), "utf8");
for (const s of ["nodeSize", "size:", "stageBg"]) {
  assert.ok(graphCanvas.includes(s), `GraphCanvas.tsx missing ${s}`);
}
// (f) graph revamp — glow layer
const glow = readFileSync(join(root, "lib/graph-glow.ts"), "utf8");
for (const s of ["export function drawGlow", "createRadialGradient", "renderedPosition", "setLineDash"]) {
  assert.ok(glow.includes(s), `graph-glow.ts missing ${s}`);
}
const graphCanvasT3 = readFileSync(join(root, "components/GraphCanvas.tsx"), "utf8");
assert.ok(graphCanvasT3.includes("drawGlow"), "GraphCanvas.tsx must call drawGlow");
// (g) graph revamp — animation loop + reduced-motion guard
for (const s of ["glowRaf", "cancelAnimationFrame(glowRaf)", "prefers-reduced-motion"]) {
  assert.ok(graphCanvasT3.includes(s), `GraphCanvas.tsx missing ${s}`);
}
console.log("check-ui: OK");
