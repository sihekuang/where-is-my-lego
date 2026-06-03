# Timeline Chronological Sort Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let readers sort the Timeline page chronologically in either direction, backed by dates parsed at build time from the fuzzy human date strings.

**Architecture:** A pure `parseDateKey()` in `scripts/derive-data.mjs` turns each fuzzy date string into a sortable `{ y, m, d }`; the build pass anchors date-less rows to the previous row and stamps each row in `timeline.json` with `sort` + a source-order `order`. `TimelineView.tsx` adds an oldest/newest toggle and a stable sort that breaks ties on `order`.

**Tech Stack:** Next.js 16 (React 19, app router), TypeScript, plain Node ESM for the build script, pnpm. No test framework is installed — parser tests run via `node` directly; UI is gated by `pnpm run build` + a manual dev check.

**Spec:** `docs/superpowers/specs/2026-06-02-timeline-chrono-sort-design.md`

---

## File Structure

- **Modify** `web/scripts/derive-data.mjs` — add `parseDateKey` (exported), a `MONTHS` map, anchoring logic in `deriveTimeline` (exported), and a run-if-main guard so the module is importable without running `main()`.
- **Create** `web/scripts/derive-data.test.mjs` — dependency-free Node tests for `parseDateKey` and the anchoring pass.
- **Modify** `web/lib/content.ts` — extend the `Row` type with optional `sort` + `order`.
- **Modify** `web/components/TimelineView.tsx` — sort state, toggle button, stable sort, stable React key.
- **Modify** `web/app/globals.css` — a small `.sort-toggle` rule.

---

## Task 1: Make `derive-data.mjs` importable and add `parseDateKey`

**Files:**
- Modify: `web/scripts/derive-data.mjs`
- Test: `web/scripts/derive-data.test.mjs` (create)

- [ ] **Step 1: Write the failing test**

Create `web/scripts/derive-data.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/derive-data.test.mjs`
Expected: FAIL — `SyntaxError: The requested module './derive-data.mjs' does not provide an export named 'parseDateKey'`

- [ ] **Step 3: Add `MONTHS` + exported `parseDateKey` and a run-if-main guard**

In `web/scripts/derive-data.mjs`, add the `MONTHS` map and `parseDateKey` just above the `classifyStatus` function:

```js
const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

// Parse a fuzzy human date string (e.g. "Late 2024 – early 2026",
// "**Nov 22, 2023**", "Ongoing (as of Jun 3, 2026)") into a sortable
// { y, m, d }. Returns null when no year is present, so the caller can
// anchor the row to its predecessor.
export function parseDateKey(raw) {
  if (!raw) return null;
  const s = raw.toLowerCase();

  // Prefer the date inside an "as of <date>" parenthetical when present.
  const asOf = s.match(/as of\s+([^)]+)/);
  const scope = asOf ? asOf[1] : s;

  // First 4-digit year wins, so a range sorts by its START year.
  const yearMatch = scope.match(/\b(?:19|20)\d{2}\b/);
  if (!yearMatch) return null;
  const y = parseInt(yearMatch[0], 10);

  // First month name, if any.
  const monMatch = scope.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/
  );
  let m = monMatch ? MONTHS[monMatch[1]] : 0;

  // First standalone 1–2 digit number (not part of the 4-digit year).
  const dayMatch = scope.match(/(?<!\d)(\d{1,2})(?!\d)/);
  let d = dayMatch ? parseInt(dayMatch[1], 10) : 0;

  // Leading season/precision qualifier (position-based: the one nearest the
  // start of the string qualifies the start year).
  const qualMatch = scope.match(/\b(early|spring|mid|late|end)\b/);
  const qual = qualMatch ? qualMatch[1] : null;

  if (m === 0) {
    m =
      qual === "early" || qual === "spring" ? 2 :
      qual === "mid" ? 6 :
      qual === "late" || qual === "end" ? 11 :
      6; // bare year → mid-year neutral
  }
  if (d === 0 && qual) {
    d =
      qual === "early" || qual === "spring" ? 5 :
      qual === "late" || qual === "end" ? 25 :
      0;
  }

  return { y, m, d };
}
```

Then, at the very bottom of the file, replace the final `main();` line with a guard so importing the module does not run the build:

```js
const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
```

(`resolve` and `fileURLToPath` are already imported at the top of the file; `process` is a Node global.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/derive-data.test.mjs`
Expected: PASS — `parseDateKey: 10 assertions passed`

- [ ] **Step 5: Commit**

```bash
git add web/scripts/derive-data.mjs web/scripts/derive-data.test.mjs
git commit -m "feat(timeline): add parseDateKey for fuzzy date strings"
```

---

## Task 2: Stamp each timeline row with `sort` + `order` (anchoring)

**Files:**
- Modify: `web/scripts/derive-data.mjs` (`deriveTimeline`)
- Test: `web/scripts/derive-data.test.mjs`

- [ ] **Step 1: Add the failing anchoring test**

Append to `web/scripts/derive-data.test.mjs`:

```js
import { deriveTimeline } from "./derive-data.mjs";

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/derive-data.test.mjs`
Expected: FAIL — `SyntaxError: ... does not provide an export named 'deriveTimeline'`

- [ ] **Step 3: Export `deriveTimeline` and compute `sort` + `order`**

In `web/scripts/derive-data.mjs`, replace the existing `deriveTimeline` function with:

```js
export function deriveTimeline() {
  const sections = parseSections(read("timeline.md"));
  // The chronological table is the one whose columns include "Status".
  const table = sections.find((s) =>
    s.columns.some((c) => /status/i.test(c))
  );
  if (!table) throw new Error("timeline.md: status table not found");
  const statusIdx = table.columns.findIndex((c) => /status/i.test(c));
  const dateIdx = table.columns.findIndex((c) => /date/i.test(c));
  const dateCol = dateIdx >= 0 ? dateIdx : 0;

  // Walk rows in source order; rows whose date has no year inherit the
  // previous row's key so they stay glued to the event they follow.
  let last = { y: 0, m: 0, d: 0 };
  const rows = table.rows.map((r, i) => {
    const key = parseDateKey(r.cells[dateCol]) ?? last;
    last = key;
    return {
      cells: r.cells,
      plain: r.plain,
      status: classifyStatus(r.cells[statusIdx] || ""),
      sort: key,
      order: i,
    };
  });
  return { columns: table.columns, statusIdx, rows };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/derive-data.test.mjs`
Expected: PASS — both lines print, e.g. `deriveTimeline: 21 rows, anchoring verified`

- [ ] **Step 5: Regenerate the data and commit**

```bash
pnpm run derive
git add web/scripts/derive-data.mjs web/scripts/derive-data.test.mjs
git commit -m "feat(timeline): stamp rows with sort key and source order"
```

(`.generated/` is git-ignored, so only the script + test are committed; `pnpm run derive` confirms the script still runs end-to-end.)

---

## Task 3: Add the sort toggle to the Timeline view

**Files:**
- Modify: `web/lib/content.ts`
- Modify: `web/components/TimelineView.tsx`
- Modify: `web/app/globals.css`

- [ ] **Step 1: Extend the `Row` type**

In `web/lib/content.ts`, replace the `Row` type:

```ts
export type Row = {
  cells: string[];
  plain: string;
  status?: string;
  sort?: { y: number; m: number; d: number };
  order?: number;
};
```

- [ ] **Step 2: Add sort state, control, and a stable sort to `TimelineView.tsx`**

In `web/components/TimelineView.tsx`:

Add the sort-direction state next to the existing state (just after `const [q, setQ] = useState("");`):

```tsx
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
```

Replace the entire `visible` memo with one that filters, then stable-sorts:

```tsx
  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = data.rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (needle && !r.plain.toLowerCase().includes(needle)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    const ZERO = { y: 0, m: 0, d: 0 };
    return filtered.slice().sort((a, b) => {
      const sa = a.sort ?? ZERO;
      const sb = b.sort ?? ZERO;
      const byDate = sa.y - sb.y || sa.m - sb.m || sa.d - sb.d;
      if (byDate !== 0) return dir * byDate;
      // Tie on date → preserve curated source order (reversed when descending).
      return dir * ((a.order ?? 0) - (b.order ?? 0));
    });
  }, [data.rows, filter, q, sortDir]);
```

Add the toggle button inside `.controls`, immediately after the `<input className="search" … />` element:

```tsx
        <button
          type="button"
          className="chip sort-toggle"
          onClick={() =>
            setSortDir((d) => (d === "asc" ? "desc" : "asc"))
          }
          aria-label={
            sortDir === "asc"
              ? "Sorted oldest first; click to show newest first"
              : "Sorted newest first; click to show oldest first"
          }
        >
          {sortDir === "asc" ? "Oldest first ↑" : "Newest first ↓"}
        </button>
```

Change the list item key from the map index to the stable `order` so rows re-order rather than re-mount. Replace:

```tsx
        {visible.map((r: Row, i) => (
          <li key={i} className={`event status-${r.status}`}>
```

with:

```tsx
        {visible.map((r: Row, i) => (
          <li key={r.order ?? i} className={`event status-${r.status}`}>
```

- [ ] **Step 3: Add the `.sort-toggle` style**

In `web/app/globals.css`, add after the `.chip-allegation.active` rule (around line 95):

```css
.sort-toggle { cursor: pointer; white-space: nowrap; }
```

- [ ] **Step 4: Typecheck and build**

Run: `pnpm run build`
Expected: PASS — `prebuild` regenerates data, then Next compiles and type-checks with no errors (`✓ Compiled successfully`).

- [ ] **Step 5: Manual verification in the dev server**

Run: `pnpm run dev`, open `http://localhost:3000/timeline`. Confirm:
- The page loads with events oldest→newest and a `Oldest first ↑` button next to the search box.
- Clicking the button flips it to `Newest first ↓` and reverses the list (1999 background row now at the bottom).
- Status filters and search still work together with the toggle.

Stop the dev server when done (`Ctrl-C`).

- [ ] **Step 6: Commit**

```bash
git add web/lib/content.ts web/components/TimelineView.tsx web/app/globals.css
git commit -m "feat(timeline): add oldest/newest chronological sort toggle"
```

---

## Self-Review

**Spec coverage:**
- Build-time `parseDateKey` (first-year, month-name, qualifier, day, `as of`) → Task 1. ✓
- Anchoring date-less rows to the previous key → Task 2. ✓
- `sort` + `order` fields on `timeline.json` rows and `Row` type → Tasks 2 & 3. ✓
- `sortDir` state, toggle button, stable tie-break on `order`, stable React key → Task 3. ✓
- Testing: pure-function parser test + anchoring test + build + manual UI check → Tasks 1–3. ✓
- Documented fuzzy tradeoff is inherent to the heuristics (no code to "implement"); covered by the spec and not contradicted by any task. ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases" — every step shows complete code or an exact command + expected output. ✓

**Type consistency:** `parseDateKey` returns `{ y, m, d } | null` everywhere; `deriveTimeline` is named identically in Task 2 code and its test; `sort`/`order` field names match across `derive-data.mjs`, `content.ts` `Row`, and `TimelineView.tsx`; the comparator reads `sort.y/m/d` and `order` exactly as emitted. ✓
