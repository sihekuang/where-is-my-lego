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
