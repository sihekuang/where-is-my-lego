import assert from "node:assert/strict";
import { BRICK_SVG, brickDataUri } from "../lib/brick-svg.ts";

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
