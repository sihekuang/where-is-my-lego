import assert from "node:assert/strict";
import { parseDateKey } from "./derive-data.mjs";

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

console.log(`parseDateKey: ${cases.length + 1} assertions passed`);
