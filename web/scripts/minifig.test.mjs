import assert from "node:assert/strict";
import { minifigDataUri } from "../lib/minifig.mjs";

const svg = (code) =>
  decodeURIComponent(minifigDataUri(code).replace("data:image/svg+xml;utf8,", ""));

// valid + deterministic
assert.ok(minifigDataUri("cma").startsWith("data:image/svg+xml;utf8,"));
assert.equal(minifigDataUri("pma"), minifigDataUri("pma"), "deterministic");

// group costumes
{
  const s = svg("pma");
  assert.ok(s.includes("#1f3f74"), "police navy uniform");
  assert.ok(s.includes("#16294b"), "police cap");
}
{
  const s = svg("bma");
  assert.ok(s.includes("#2d323b"), "suit jacket");
  assert.ok(s.includes("#b23b3b"), "red tie");
}
assert.ok(svg("cma").includes("#2f9e63"), "civilian green shirt");

// gender cues
{
  const f = svg("cfa");
  assert.ok(f.includes("#c0392b"), "female lips");
  assert.ok(f.includes("#c65d8a"), "female pink shirt");
}
assert.ok(!svg("cma").includes("#c0392b"), "male: no lips");

// age cue
assert.ok(svg("cme").includes("#34383e"), "elder glasses");
assert.ok(!svg("cma").includes("#34383e"), "adult: no glasses");

// nearest-match: young is not drawn -> resolves to the adult figure
assert.equal(minifigDataUri("cmy"), minifigDataUri("cma"), "young degrades to adult");

// partial code fills defaults (group p, gender m, age a)
assert.equal(minifigDataUri("p"), minifigDataUri("pma"), "partial code defaults");

// garbage / empty -> civilian male adult, never throws
assert.equal(minifigDataUri("zzz"), minifigDataUri("cma"), "garbage -> cma");
assert.ok(minifigDataUri("").startsWith("data:"));
assert.ok(minifigDataUri(undefined).startsWith("data:"));

console.log("minifig: all assertions passed");
