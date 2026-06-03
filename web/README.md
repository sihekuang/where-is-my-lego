# Web — interactive viewer for the `bam-scandal` archive

A **read-only** Next.js site that renders the archive in the repository root. It never modifies the
source: a build step (`scripts/derive-data.mjs`) parses the canonical root Markdown into JSON + prose
copies under `web/.generated/` (git-ignored), and the app reads only those artifacts.

```
root *.md  ──(derive-data.mjs)──►  web/.generated/{data,content}  ──►  Next.js (read-only render)
   ▲ canonical, untouched              build artifact, git-ignored
```

## Local development

```bash
cd web
npm install
npm run dev      # predev runs derive-data automatically; http://localhost:3000
```

`npm run build` (used by Vercel) runs `derive-data` via `prebuild`, so the site is always regenerated
from the current Markdown — the derived data can never drift from the source.

## Deploy to Vercel

1. Import the GitHub repo `sihekuang/bam-scandal` into Vercel (New Project → Import).
2. **Set "Root Directory" to `web`.** This is the only non-default setting required — the app lives in
   the `web/` subfolder while the canonical Markdown stays at the repo root (the build reads `../*.md`).
3. Framework preset: **Next.js** (auto-detected). Build command and output dir: defaults.
4. Deploy. Every push to the connected branch rebuilds and re-derives data from the Markdown.

> Because the build reads Markdown from the repository root, keep "Root Directory" = `web` (not the
> repo root) so Next builds the app, while the parent `.md` files remain available to the build.

## How content maps to pages

| Source Markdown (root)            | Route                  |
|-----------------------------------|------------------------|
| `README.md`                       | `/`                    |
| `timeline.md`                     | `/timeline` (filterable) |
| `parties.md`                      | `/parties` (searchable)  |
| `lawsuit/README.md`               | `/lawsuit`             |
| `lawsuit/court-documents.md`      | `/lawsuit/documents`   |
| `police-controversy.md`           | `/police`              |
| `media/news-articles.md` + `media/primary-sources.md` | `/media` (searchable) |
| `DISCLAIMER.md`                   | `/disclaimer`          |

To change content, edit the **Markdown at the repo root** — never edit `web/.generated/`.

## Structure

```
web/
  scripts/derive-data.mjs   # Markdown -> JSON/prose (zero-dependency)
  lib/content.ts            # loads generated artifacts (server-side)
  lib/links.ts              # rewrites internal .md links -> routes
  components/               # Markdown, TimelineView, SectionedTable
  app/                      # routes (App Router)
```
