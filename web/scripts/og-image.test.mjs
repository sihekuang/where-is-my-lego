import assert from "node:assert/strict";
import { BRICK_SVG, brickDataUri } from "../lib/brick-svg.mjs";

// Shapes-only: the three brick faces are present...
assert.ok(BRICK_SVG.includes("#b06a18"), "right face fill present");
assert.ok(BRICK_SVG.includes("#f0a24a"), "top face fill present");
assert.ok(BRICK_SVG.includes("#d8862a"), "front face fill present");

// ...and all 8 studs are present.
const studCount = (BRICK_SVG.match(/<ellipse/g) || []).length;
assert.equal(studCount, 8, "expected 8 stud ellipses");

// Robustness invariant: NO <text> in the SVG (Satori can't reliably render it;
// the "?" is overlaid as a div in the card instead).
assert.ok(!BRICK_SVG.includes("<text"), "SVG must not contain <text>");

// Well-formed SVG sized for the card.
assert.ok(BRICK_SVG.trimStart().startsWith("<svg"), "starts with <svg>");
assert.ok(BRICK_SVG.includes('viewBox="0 0 64 64"'), "has 64x64 viewBox");

// Data URI round-trips back to the SVG.
assert.ok(brickDataUri.startsWith("data:image/svg+xml,"), "is an svg data uri");
assert.equal(
  decodeURIComponent(brickDataUri.replace("data:image/svg+xml,", "")),
  BRICK_SVG,
  "data uri decodes to BRICK_SVG",
);

console.log("brick-svg: 9 assertions passed");

// ---------------------------------------------------------------------------
// graph-motif.mjs — shared static graph still (hero fallback + OG card)
// ---------------------------------------------------------------------------
import { buildGraphMotifSvg, graphMotifDataUri } from "../lib/graph-motif.mjs";

const MOTIF_DATA = {
  nodes: [
    { id: "bam", side: "plaintiff", pos: { x: 0.4, y: 0.5 } },
    { id: "ben", side: "defendant", pos: { x: 0.6, y: 0.5 } },
    { id: "x", side: "official", pos: { x: 0.2, y: 0.2 } },
  ],
  edges: [
    { source: "bam", target: "ben", category: "legal", status: "ALLEGATION" },
    { source: "bam", target: "x", category: "corporate", status: "CONFIRMED" },
  ],
};

const svg = buildGraphMotifSvg(MOTIF_DATA, { width: 1200, height: 630, theme: "dark" });
assert.ok(svg.trimStart().startsWith("<svg"), "motif starts with <svg>");
assert.ok(svg.includes('width="1200"') && svg.includes('height="630"'), "motif sized to args");
assert.ok(!svg.includes("<text"), "motif must not contain <text> (Satori reliability)");
assert.equal((svg.match(/<circle/g) || []).length, MOTIF_DATA.nodes.length * 2, "one halo + one body circle per node");
assert.equal((svg.match(/<line/g) || []).length, MOTIF_DATA.edges.length, "a line per edge");
assert.ok(svg.includes("stroke-dasharray"), "allegation edge renders dashed");

const uri = graphMotifDataUri(MOTIF_DATA, { width: 1200, height: 630, theme: "dark" });
assert.ok(uri.startsWith("data:image/svg+xml,"), "motif data uri prefix");
assert.ok(decodeURIComponent(uri.replace("data:image/svg+xml,", "")).startsWith("<svg"), "data uri decodes to svg");

console.log("graph-motif: 8 assertions passed");
