# Timeline Chronological Sort — Design

**Date:** 2026-06-02
**Status:** Approved (design)
**Scope:** `web/` only — the canonical root Markdown archive is untouched.

## Goal

Let a reader of the Timeline page sort events chronologically in either
direction (oldest→newest or newest→oldest), backed by parsed dates so the
ordering stays correct even if the source order changes later.

## Background

- The Timeline is authored in `timeline.md` as a single Markdown table, already
  written oldest→newest by hand.
- `web/scripts/derive-data.mjs` parses that table into
  `web/.generated/data/timeline.json` (a build artifact under a git-ignored
  directory). Zero runtime dependencies — plain Node.
- `web/components/TimelineView.tsx` ("use client") renders the rows as an
  ordered list with a status filter and a free-text search. It currently
  displays rows in **document order**.

The Date column holds **fuzzy human strings**, not machine dates. Representative
values from the source:

| Raw date string | Notes |
|---|---|
| `~1999–2000 onward` | year range, no month |
| `**Nov 22, 2023**` | precise (bold markdown) |
| `~Nov 2024` | year + month, no day |
| `Late 2024 – early 2026` | qualified year range |
| `Early 2026` | qualified, year only |
| `**Mar 8–11, 2026**` | day range |
| `Evening Mar 11, 2026` | precise day + time-of-day qualifier |
| `(warrant return)` | **no parseable date** |
| `~May 30–31, 2026` | day range |
| `Late May 2026` | qualified month |
| `Ongoing (as of Jun 3, 2026)` | parenthetical "as of" date |

## Approach

Date parsing happens **at build time** in `derive-data.mjs` (chosen over
client-time parsing or polluting the canonical `.md`). `.generated/` is already
the layer where all derivation lives; the React component stays a thin view, and
the parser is a pure, testable function.

## Components

### 1. `parseDateKey(str)` — pure function in `derive-data.mjs`

Returns `{ y, m, d }` (all integers) representing a sortable date:

- **Year (`y`)** — the **first** 4-digit year (`19xx`/`20xx`) in the string. For
  a range like `Late 2024 – early 2026`, this yields the **start** year (2024).
  If no year is found, the string is treated as date-less (see anchoring below).
- **Month (`m`, 1–12)** — the first month name found. If absent, a qualifier
  sets it: `Early`/`Spring` → 2, `Mid` → 6, `Late`/`End` → 11; a bare year with
  no qualifier → 6 (mid-year neutral). (`Late` maps to 11, not 10, so a
  `Late <year>` row ties with that year's November events and preserves source
  order rather than jumping ahead of them.)
- **Day (`d`, 1–31)** — the first day number found. If absent, a month qualifier
  nudges it: `Early <Month>` → 5, `Late <Month>` → 25; otherwise 0.
- **`as of` dates** — when present (e.g. `Ongoing (as of Jun 3, 2026)`), parse
  the date inside the parenthetical.

### 2. Anchoring date-less rows (`derive-data.mjs`)

Rows whose date yields **no year** (only `(warrant return)` in the current
source) **inherit the previous row's `{ y, m, d }`**, keeping them glued to the
event they follow. This is applied during a single pass over the rows in source
order.

### 3. Augmented `timeline.json`

Each row gains two fields; all existing fields are preserved so other consumers
are unaffected:

```jsonc
{
  "cells": [...],
  "plain": "...",
  "status": "confirmed",
  "sort": { "y": 2026, "m": 3, "d": 11 },  // parsed/anchored sort key
  "order": 7                                 // original source index (0-based)
}
```

`lib/content.ts`'s `Row` type gains the matching optional fields.

### 4. `TimelineView.tsx` — sort state, control, and stable sort

- New state: `sortDir: "asc" | "desc"`, default `"asc"` (oldest→newest, matching
  today's display).
- The `visible` memo gains a final `.sort()` (after filter/search) comparing by
  `(y, m, d)`, **with `order` as the tie-breaker** so same-date rows keep their
  curated sequence (the two `May 21, 2026` rows, the `Mar 11` morning/evening
  pair, the anchored `(warrant return)`). `desc` reverses the comparator.
- New UI: one button in the existing `.controls` row, next to the search input,
  toggling label/icon between **`Oldest first ↑`** and **`Newest first ↓`**.
  Styled to match the existing `.chip` (new `.sort-toggle` class if any
  override is needed). The `sortDir` is added to the `visible` memo deps.
- The list's React `key` switches from the map index to the stable `order`, so
  rows are re-ordered rather than re-mounted when the direction flips.

## Data flow

```
timeline.md
  └─(derive-data.mjs: parseDateKey + anchoring)→ timeline.json  [adds sort, order]
       └─(lib/content.ts: getTimeline)→ Timeline
            └─(TimelineView: filter → search → stable sort by sortDir)→ <ol>
```

## Error handling / edge cases

- **No year anywhere** → inherit previous row's key (anchoring). The first row,
  if date-less, defaults to `{ y: 0, m: 0, d: 0 }` (sorts first ascending).
- **Tie on `(y, m, d)`** → preserve source order via `order`.
- **Coarse / qualified / summary rows** — a few rows whose parsed dates are
  near-simultaneous or summarial may shift relative to the hand-authored order.
  Known cases: `Late May 2026`, whose qualifier-derived day (25) places it among
  the other late-May dated rows — so it moves up past the explicit `May 26`–`30`
  entries to just after the `May 21` pair (a multi-position shift, not a local
  swap); and the trailing `Ongoing (as of Jun 3, 2026)` wrap-up row (parses to
  Jun 3, so it sorts just before the `Jun 8` scheduled appearance). This is
  accepted and documented; **exact-date ties are always preserved** via `order`.
- Parsing never throws — unmatched fields fall back to defaults / anchoring.

## Testing

- A small Node test (run via `node`, no test framework needed) asserts:
  - `parseDateKey` returns expected `{ y, m, d }` for the representative strings
    in the table above.
  - Sorting the real derived `timeline.json` ascending reproduces source order
    for all exact-date rows (allowing the documented fuzzy-pair exception).
- Manual: run the dev build, confirm the timeline renders, the toggle flips
  direction, and filter + search still compose with sorting.

## Out of scope

- Sorting any other table (parties, media).
- Persisting the chosen sort direction across sessions.
- Editing the canonical `timeline.md`.
