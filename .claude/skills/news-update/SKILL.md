---
name: news-update
description: Use when a new development in the BAM / Reckless Ben case surfaces — the user drops a Reddit thread, news article, video, court filing, or rumor (e.g. "looks like X happened, can you verify and update?"), or a case claim needs verification against sources.
---

# Case News Update

## Overview

End-to-end playbook for turning a reported development into a verified, sourced archive update. **The deliverable is an open PR, not a question** — verify, edit, independently verify, ship. Encode uncertainty in status labels and ⚠ markers, not in requests for permission.

## Verify (Agent A)

- **Reddit is blocked** from this environment. Use the redlib mirror: `https://redlib.perennialte.ch/r/RecklessBen/...` (same path as reddit.com). Image posts: fetch the `/preview/pre/....jpeg` href and Read it.
- Videos: use the `watch` skill for transcripts.
- **Anchor every claim to a timestamped primary artifact.** For page-state claims (up/down/changed/amount), capture the page itself (curl with a Chrome UA; GoFundMe-style pages embed JSON with amounts, donation counts, goal history) **and bracket the change with Wayback CDX**: `web.archive.org/cdx/search/cdx?url=<url>&from=YYYYMMDD&to=YYYYMMDD&fl=timestamp,statuscode&collapse=timestamp:8` (flaky — retry on 502/504).
- Corroborate via WebSearch across the outlets the archive already trusts. A party's own statement is a primary source for *what they said*, never for the underlying fact.

## Author

- Edit **root Markdown only**, per CLAUDE.md's sourcing/labeling rules (CONFIRMED / ALLEGATION / Reported; preserve ⚠ conflicts; never launder contested figures).
- Append timeline rows **at the physical end of the table** — mid-table inserts shift i18n row indices and cascade re-translations; rendering sorts by date anyway.
- **Every outlet newly cited in a row gets a URL row in `media/news-articles.md`** (or `primary-sources.md` / `community-sources.md` as fits). If older coverage said "unreported" and that changed, update the old row too.
- Gate: `cd web && pnpm derive && pnpm test`.

## Independent verification (Agent B) — required

Per CLAUDE.md's two-agent rule: dispatch a verifier with the claims **as written** plus bare citation URLs (not your summaries). B re-opens every source. Downgrade anything B can't independently reach. Record the chain in the commit/PR body.

## Ship

- Branch **fresh off pulled `origin/main`** (`git fetch && git merge-base HEAD origin/main` must equal `origin/main`). Conventional commit (`docs(archive): …`), push, **open the PR without asking** — the owner merges.
- **Check for competing bot PRs**: `gh pr list` — `auto/news-*` branches may have edited the same rows with staler facts. Flag overlaps and propose a merge order (graft their *new facts* onto the fresher narrative; don't let a stale PR overwrite newer reality).

## Translate

- Same PR **iff** the branch is fresh off current `origin/main` and `node scripts/translate.mjs --check` shows only your units (no key needed); otherwise a separate PR after merge. Then `node --env-file=.env scripts/translate.mjs` (key in gitignored `web/.env`).
- **Quote-normalization sweep (always)**: machine translation renders the same verbatim quote differently per file. Pick one faithful rendering per locale and sweep timeline + media data files (**cells AND `plain` copies**) + prose. Hand-edits are drift-durable. Re-run `pnpm test` (glossary) and `translate.mjs --check` (must be 0).

## Ask the owner only for

Neutrality/PII line judgments, or sources in irreconcilable conflict that labels can't express. Everything else: proceed, and surface caveats in the PR body and final summary.

## Afterwards

Update auto-memory (if available) with the outcome and any new gotchas.
