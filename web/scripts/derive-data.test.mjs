import assert from "node:assert/strict";
import { parseDateKey, deriveTimeline } from "./derive-data.mjs";

const cases = [
  ["**Nov 22, 2023**", { y: 2023, m: 11, d: 22 }],
  ["~Nov 2024", { y: 2024, m: 11, d: 0 }],
  ["~1999–2000 onward", { y: 1999, m: 6, d: 0 }],
  ["Late 2024 – early 2026", { y: 2024, m: 11, d: 25 }],
  ["Early 2026", { y: 2026, m: 2, d: 5 }],
  ["**Mar 8–11, 2026**", { y: 2026, m: 3, d: 8 }],
  ["Evening Mar 11, 2026", { y: 2026, m: 3, d: 11 }],
  ["Late May 2026", { y: 2026, m: 5, d: 25 }],
  ["Ongoing (as of Jun 3, 2026)", { y: 2026, m: 6, d: 3 }],
];

for (const [input, expected] of cases) {
  assert.deepEqual(
    parseDateKey(input),
    expected,
    `parseDateKey(${JSON.stringify(input)})`
  );
}

assert.equal(parseDateKey("(warrant return)"), null, "date-less returns null");
assert.equal(parseDateKey(null), null, "null input returns null");

console.log(`parseDateKey: ${cases.length + 2} assertions passed`);

const timeline = deriveTimeline();
const dateCol = timeline.columns.findIndex((c) => /date/i.test(c));

// Semantic column indices are exported (locale-independent) so the client never
// re-detects them from column NAMES, which break once headers are translated.
assert.equal(timeline.dateIdx, timeline.columns.findIndex((c) => /date/i.test(c)), "dateIdx exported");
assert.equal(timeline.eventIdx, timeline.columns.findIndex((c) => /event/i.test(c)), "eventIdx exported");
assert.equal(timeline.sourceIdx, timeline.columns.findIndex((c) => /source/i.test(c)), "sourceIdx exported");
assert.ok(timeline.dateIdx >= 0 && timeline.eventIdx >= 0, "date/event columns found");

// Every row gets a numeric sort key with a real year (anchoring fills the gaps).
timeline.rows.forEach((r, i) => {
  assert.ok(r.sort && r.sort.y > 0, `row ${i} has a sort year`);
  assert.equal(r.order, i, `row ${i} has source order ${i}`);
});

// The date-less row inherits the previous row's key.
const dateless = timeline.rows.findIndex(
  (r) => parseDateKey(r.cells[dateCol]) === null
);
assert.ok(dateless > 0, "found a date-less row to anchor");
assert.deepEqual(
  timeline.rows[dateless].sort,
  timeline.rows[dateless - 1].sort,
  "date-less row inherits the previous row's sort key"
);

console.log(`deriveTimeline: ${timeline.rows.length} rows, anchoring verified`);

// Integration: ascending sort (the same comparator the Timeline view uses) keeps
// exact-date ties in their curated source order — e.g. the two "May 21, 2026"
// rows and the "Mar 11" morning/evening/(warrant return) group stay in their
// authored sequence. (Fuzzy rows may shift between dates; ties never do.)
const asc = timeline.rows
  .map((r) => ({ ...r.sort, order: r.order }))
  .sort((a, b) => a.y - b.y || a.m - b.m || a.d - b.d || a.order - b.order);

const tieGroups = new Map();
for (const r of asc) {
  const k = `${r.y}-${r.m}-${r.d}`;
  if (!tieGroups.has(k)) tieGroups.set(k, []);
  tieGroups.get(k).push(r.order);
}

let tiesChecked = 0;
for (const [k, orders] of tieGroups) {
  if (orders.length < 2) continue;
  tiesChecked++;
  const inSourceOrder = [...orders].sort((a, b) => a - b);
  assert.deepEqual(orders, inSourceOrder, `tie group ${k} preserves source order`);
}
assert.ok(tiesChecked > 0, "expected at least one exact-date tie group to verify");

console.log(`deriveTimeline: ${tiesChecked} exact-date tie groups preserve source order`);

// ---------------------------------------------------------------------------
// deriveRelationships
// ---------------------------------------------------------------------------
import { deriveRelationships } from "./derive-data.mjs";

const SAMPLE = `
## Nodes

| Id | Label | Type | Side | Icon | Role | Statement |
|----|-------|------|------|------|------|-----------|
| ben-schneider | Reckless Ben (Schneider) | person | defendant | https://example.com/ben.jpg | YouTuber | quote |
| sneaky | Sneaky Citizen | person | neutral | https://example.com/face.jpg | bystander |  |
| acme | Acme LLC | org | plaintiff | https://example.com/logo.png |  |  |

## Edges

| Source | Relationship | Target | Category | Direction | Status | Note |
|--------|--------------|--------|----------|-----------|--------|------|
| acme | sued | ben-schneider | legal | → | CONFIRMED | n1 |
| ben-schneider | associate | sneaky | investigative | ↔ | ALLEGATION |  |
| ben-schneider | self | ben-schneider | corporate | — | CONFIRMED |  |
`;

const PARTIES_STUB = `
## Roster
| Name | Public role |
|------|-------------|
| Reckless Ben | YouTuber |
| Acme LLC | franchisor |
`;

// Allowlisted person keeps icon; org keeps icon; non-allowlisted person drops it + warns.
{
  const warnings = [];
  const rel = deriveRelationships({ md: SAMPLE, partiesMd: PARTIES_STUB, warn: (m) => warnings.push(m) });

  const ben = rel.nodes.find((n) => n.id === "ben-schneider");
  const sneaky = rel.nodes.find((n) => n.id === "sneaky");
  const acme = rel.nodes.find((n) => n.id === "acme");

  assert.equal(ben.icon, "https://example.com/ben.jpg", "allowlisted person keeps icon");
  assert.equal(ben.ini, "RB", "initials derived (first+last word, parentheticals dropped)");
  assert.equal(sneaky.icon, undefined, "non-allowlisted person icon dropped");
  assert.equal(sneaky.ini, "SC", "dropped-icon node gets initials");
  assert.equal(acme.icon, "https://example.com/logo.png", "org keeps icon");
  assert.ok(
    warnings.some((w) => w.includes("sneaky")),
    "ethics guard warns on disallowed person icon"
  );

  const sued = rel.edges.find((e) => e.label === "sued");
  assert.deepEqual(
    { s: sued.source, t: sued.target, c: sued.category, d: sued.direction, st: sued.status, n: sued.note },
    { s: "acme", t: "ben-schneider", c: "legal", d: "to", st: "CONFIRMED", n: "n1" },
    "edge fields parsed + direction normalized"
  );
  assert.equal(rel.edges.find((e) => e.label === "associate").direction, "both", "↔ → both");
  assert.equal(rel.edges.find((e) => e.label === "self").direction, "none", "— → none");

  console.log(`deriveRelationships: sample parse + ethics guard passed (${warnings.length} warning)`);
}

// Validation throws.
assert.throws(
  () => deriveRelationships({ md: SAMPLE.replace("| acme | sued | ben-schneider |", "| acme | sued | ghost |"), partiesMd: PARTIES_STUB, warn() {} }),
  /not a known node id/,
  "unknown edge target throws"
);
assert.throws(
  () => deriveRelationships({ md: SAMPLE.replace("| legal | →", "| bogus | →"), partiesMd: PARTIES_STUB, warn() {} }),
  /unknown Category/,
  "unknown category throws"
);
assert.throws(
  () => deriveRelationships({ md: SAMPLE.replace("person | defendant", "person | sidekick"), partiesMd: PARTIES_STUB, warn() {} }),
  /unknown Side/,
  "unknown side throws"
);
console.log("deriveRelationships: validation throws verified");

// Integration against the real canonical file.
{
  const rel = deriveRelationships();
  assert.ok(rel.nodes.length >= 15, "real file: >=15 nodes");
  const ids = new Set(rel.nodes.map((n) => n.id));
  for (const e of rel.edges) {
    assert.ok(ids.has(e.source) && ids.has(e.target), `edge ${e.source}->${e.target} endpoints exist`);
  }
  assert.equal(rel.nodes.find((n) => n.id === "ben-schneider").icon, "https://unavatar.io/youtube/RecklessBen", "real: Schneider keeps icon");
  assert.ok(rel.nodes.filter((n) => n.type === "person" && n.id !== "ben-schneider").every((n) => !n.icon), "real: no other person has an icon");
  console.log(`deriveRelationships: real file OK (${rel.nodes.length} nodes, ${rel.edges.length} edges)`);
}
