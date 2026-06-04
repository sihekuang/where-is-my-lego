# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## What this repo is

`where-is-my-lego` is a **sourced research archive** of the *Bricks & Minifigs (BAM) –
"Reckless Ben" controversy* — a public dispute over a consigned LEGO Star Wars collection that
escalated into a viral YouTube investigation, criminal charges, a police controversy, and a
multi-count Utah civil lawsuit.

It has **two layers**:

1. **The canonical archive** — plain Markdown at the repository root. This is the source of truth.
2. **The web viewer** (`web/`) — a **read-only** Next.js site that renders the archive. It never
   modifies the source; a build step derives JSON + prose copies from the root Markdown.

```
root *.md  ──(web/scripts/derive-data.mjs)──►  web/.generated/{data,content}  ──►  Next.js render
   ▲ canonical, hand-edited                        build artifact, git-ignored      read-only
```

## The golden rules

1. **To change content, edit the Markdown at the repository root.** Never edit `web/.generated/`
   (git-ignored build output — it is wiped and regenerated on every `derive`, `dev`, and `build`).
2. **This is a research record, not advocacy.** Preserve neutrality. Every substantive claim must be
   attributed to a public source and labeled **CONFIRMED**, **ALLEGATION**, or **Reported**
   (see "Sourcing & labeling" below). Do not assert as fact anything a court has not adjudicated.
3. **No private personal information (PII).** Individuals appear only in their *public roles* and
   *public statements*. Never add home addresses, personal phone numbers, family details, private
   photos, etc. — for any party, including police officers. This is an enforced ethical scope choice
   (doxxing/harassment are themselves contested allegations in this case). See `DISCLAIMER.md`.
4. **Do not commit copyrighted or downloaded media.** Media is *cataloged by link*, never re-hosted.
   The `media/_downloads/`, `lawsuit/filings/`, and `lawsuit/police/` paths are git-ignored.

## Repository layout

### Canonical archive (repo root — edit these)

| File | Contents |
|---|---|
| `README.md` | Overview + one-paragraph summary + index → renders at `/` |
| `timeline.md` | Chronological event table (2023–2026), per-event sourcing → `/timeline` |
| `parties.md` | Each party and their **public role** → `/parties` |
| `relationships.md` | Structured node/edge tables for the relationship graph → `/parties` graph |
| `lawsuit/README.md` | Legal summary: caption, court, causes of action, relief → `/lawsuit` |
| `lawsuit/court-documents.md` | Where to obtain the actual filings → `/lawsuit/documents` |
| `police-controversy.md` | Arrests, search warrant, AFPD controversy → `/police` |
| `media/news-articles.md` | Cataloged news & commentary → `/media` |
| `media/primary-sources.md` | Cataloged videos, official statements, social posts → `/media#primary` |
| `media/download_manifest.md` | Link manifest + `fetch_media.sh` to fetch media elsewhere |
| `DISCLAIMER.md` | Scope, methodology, limitations, ethics → `/disclaimer` |

### Web viewer (`web/`)

```
web/
  scripts/
    derive-data.mjs        # Markdown -> JSON/prose. ZERO-dependency Node. The build's heart.
    derive-data.test.mjs   # unit tests for the parser (date keys, relationship validation, …)
    og-image.test.mjs      # tests for the OG-image generation
    check-ui.test.mjs      # guards against legacy CSS tokens / dead classNames
    verify-seo.mjs         # SEO sanity checks
  lib/
    content.ts             # server-side loaders for web/.generated/ artifacts (+ types)
    links.ts               # rewrites internal .md links -> site routes at render time
    seo.ts                 # SITE_URL/NAME + pageMetadata() helper
    structured-data.ts     # JSON-LD builders
    og-image.tsx           # shared OpenGraph image renderer
    brick-svg.mjs          # the LEGO-brick site icon, as data
    fonts.ts, graph-style.ts, utils.ts (cn)
  components/
    Markdown.tsx           # react-markdown + remark-gfm, with links rewritten via lib/links
    TimelineView.tsx       # filter/search timeline (client)
    SectionedTable.tsx     # searchable sectioned tables (parties, media)
    RelationshipGraph.tsx + GraphCanvas.tsx  # cytoscape graph (client)
    brick/BrickCard.tsx, brick/StudRow.tsx   # LEGO-brick UI primitives
    ui/                    # shadcn components (button, dropdown-menu)
    JsonLd.tsx, ModeToggle.tsx, theme-provider.tsx
  app/                     # Next.js App Router; one folder per route + opengraph-image.tsx each
    layout.tsx             # header/nav, theme, the read-only banner, analytics
    sitemap.ts, robots.ts, manifest.ts, icon.svg, opengraph-image.tsx
```

## Development workflow

This project uses **pnpm** (pinned via `packageManager` in `web/package.json`). Run everything from
`web/`:

```bash
cd web
pnpm install
pnpm dev      # `predev` runs derive-data first; serves http://localhost:3000
pnpm build    # `prebuild` runs derive-data first; production build
pnpm lint     # eslint (eslint-config-next)
pnpm test     # runs derive-data.test + og-image.test + check-ui.test
```

- `pnpm derive` regenerates `web/.generated/` from the root Markdown on demand.
- Because `predev`/`prebuild` always re-derive, **the generated data can never drift from the
  source** — you don't manually regenerate after editing Markdown; just restart/rebuild.
- After changing anything under `web/`, run `pnpm lint && pnpm test` before committing. After editing
  root Markdown that feeds structured views (`timeline.md`, `parties.md`, `relationships.md`), run
  `pnpm derive` (or `pnpm test`) to confirm it still parses.

## Sourcing & labeling conventions (content)

### Two-agent independent verification (required)

**No source-backed claim is added or its status raised on a single agent's say-so.** Sourcing must be
done by **at least two agents verifying the sources independently**:

- **Agent A (author)** adds or edits the claim, cites the source(s), and proposes a status.
- **Agent B (verifier)** independently re-opens *each cited source* and confirms it actually supports
  the claim as written — without relying on Agent A's summary. B works from the primary citation, not
  from A's notes.
- A claim is only labeled **CONFIRMED** when **both** agents independently reach it from the cited
  evidence. If they disagree, or B cannot independently corroborate, the claim is downgraded to
  `ALLEGATION` or `Reported` and the disagreement is flagged inline (the "⚠" marker).
- `CONFIRMED` still requires the underlying standard below (court records, agency statements, or
  **multiple independent outlets**) — two agents agreeing on one weak source is not enough; the
  second agent's job is to test the source, not to rubber-stamp the author.
- Record who verified what in the PR/commit description (e.g. "verified by <agent B> against
  Salt Lake Tribune + American Fork Citizen") so the chain is auditable.

This is a guardrail against a single agent hallucinating or over-reading a source — the failure mode
that would most damage the archive's credibility.

### Status & attribution

- Each substantive timeline/claim carries a **Status**: `CONFIRMED` (court records, agency
  statements, or multiple independent outlets), `ALLEGATION` (a contested contention by one side,
  not adjudicated), or `Reported` (single/secondary sourcing). The derive step classifies status by
  scanning for these keywords (`classifyStatus`), and the UI styles them by status — so the exact
  words matter.
- Always cite **Source(s)** in the dedicated table column.
- Flag conflicts between sources inline (the archive uses a "⚠" marker for single-sourced or
  conflicting details, e.g. disputed dates/case numbers). Preserve these — do not silently resolve
  conflicts.
- Keep the disputed-figure framing intact (e.g. the "~$200,000" collection value is *family-valued
  and disputed*). Don't launder contested numbers into settled facts.

## Structured-data formats (parsed by `derive-data.mjs`)

The parser is a generic GitHub-flavored Markdown **table** reader. It only understands tables under
headings; it does not run a full Markdown AST. Keep these contracts when editing:

### `timeline.md`
- The chronological table is identified by having a column matching `/status/i` and one matching
  `/date/i`. Rows are sorted by a fuzzy date key parsed from the date cell (`parseDateKey` handles
  "Late 2024 – early 2026", "**Nov 22, 2023**", "as of Jun 3, 2026", seasons, etc.). A row with no
  year inherits the previous row's date so it stays glued in place.

### `relationships.md` (validated — a bad edit fails the build)
Two tables: **Nodes** and **Edges**. `deriveRelationships` throws on violations, so:
- **Nodes** need columns `Id | Label | Type | Side` (plus optional `Icon | Role | Statement`).
  - `Type` ∈ `person | org | agency`; `Side` ∈ `plaintiff | defendant | official | neutral`.
- **Edges** need `Source | Relationship | Target | Category` (plus optional `Direction | Status |
  Note`).
  - `Source`/`Target` must be existing node `Id`s.
  - `Category` ∈ `legal | corporate | familial | transactional | investigative | law-enforcement`.
  - `Direction`: `→`/`to` (directed), `↔`/`both` (mutual), `—`/`none` (symmetric).
  - `Status` ∈ `CONFIRMED | ALLEGATION` (allegation renders dashed).
- **Icon ethics guard:** a `person` node may only carry an `Icon` if its id is in the
  `ICON_ALLOWLIST` in `derive-data.mjs` (currently public self-publisher `ben-schneider`). Icons for
  other people are dropped with a warning. Org/agency logos and public emblems are fine — and must be
  *linked, never re-hosted*.
- A drift guard warns if a name in `parties.md` has no matching graph node — keep the two in sync.

### `parties.md` / `media/*.md`
- Rendered as searchable "sectioned tables" — any heading followed by a Markdown table becomes a
  searchable section. Add new sections as `## Heading` + a table.

## Web conventions

- **App Router + React Server Components** by default. Interactive pieces (`TimelineView`,
  `SectionedTable`, `RelationshipGraph`/`GraphCanvas`, `ModeToggle`) are client components.
- **Tailwind CSS v4** + **shadcn/ui** + a custom LEGO-brick design language (`components/brick/`,
  brick CSS tokens in `app/globals.css`). Light/dark via `next-themes`. Use the `cn()` helper from
  `lib/utils`. `check-ui.test.mjs` enforces that brick tokens exist and dead legacy classNames stay
  gone — don't reintroduce the listed legacy selectors.
- **Internal links:** root Markdown keeps GitHub-friendly relative `.md` links; `lib/links.ts`
  rewrites them to routes at render time. If you add a new page/source file, update the `MAP` in
  `lib/links.ts` (and the `PROSE`/route mapping in `derive-data.mjs` for prose pages).
- **SEO:** each route exports `metadata` via `pageMetadata()` from `lib/seo.ts` and renders an
  `opengraph-image.tsx`. Article `dateModified` comes from the generated artifact's mtime
  (`generatedMtime`). `SITE_URL` defaults to `https://www.whereismylego.com`, overridable with
  `NEXT_PUBLIC_SITE_URL` (see `web/.env.example`). Keep `sitemap.ts`/`robots.ts` current when adding
  routes.

## Deployment

Hosted on **Vercel**. The only non-default setting: **Root Directory = `web`** (the app lives in
`web/` while the canonical Markdown stays at the repo root; the build reads `../*.md`). Framework
preset Next.js; build command and output are defaults. Every push to the connected branch re-derives
data from the Markdown and rebuilds. Analytics + Speed Insights (`@vercel/*`) are wired in
`app/layout.tsx`.

## Git conventions

- Commits follow **Conventional Commits** with a scope, e.g. `feat(web): …`, `docs(archive): …`,
  `chore(archive): …`, `feat(og): …`. Match this style.
- Develop on a feature branch; open PRs against `main`. Do not create a PR unless asked.
- When in doubt about whether a content change crosses the neutrality/PII line, prefer to ask rather
  than guess — the integrity of the archive is the point of the project.
