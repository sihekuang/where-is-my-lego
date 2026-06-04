# Contributing

Thanks for helping keep this archive accurate. It documents an **actively contested** dispute, so
contributions are held to a strict standard: **everything is sourced, labeled, and free of private
personal information.** You can contribute **without cloning the repo or any local setup** — see the
two paths below.

This guide is written for both human contributors and AI agents. Agents should also read
[`AGENTS.md`](./AGENTS.md) and [`SKILL.md`](./SKILL.md); the authoritative policy is in
[`DISCLAIMER.md`](./DISCLAIMER.md).

## What you edit

- Edit the **canonical root Markdown** only: `README.md`, `timeline.md`, `parties.md`,
  `relationships.md`, `police-controversy.md`, `lawsuit/*.md`, `media/*.md`, `DISCLAIMER.md`.
- **Do not edit `web/.generated/`.** The `web/` site is *derived* from the root `.md` by
  `npm run derive`; editing generated output has no effect. A content change is just a Markdown edit.
- Put new content in the right file: an event → `timeline.md`; a person/entity → `parties.md`
  **and** the graph in `relationships.md`; a source → the catalogs in `media/`.

## Pre-submit checklist (every change must pass)

- [ ] **Sourced.** Every new/changed claim cites a public source; the source is added to
      `media/news-articles.md` or `media/primary-sources.md` if not already there. No fabricated
      URLs. Primary records preferred over aggregators.
- [ ] **Labeled.** Each claim is marked **CONFIRMED** (court records / official statements / multiple
      independent outlets) or **ALLEGATION** (a contested, unadjudicated contention). Source
      conflicts are flagged inline with `⚠` rather than silently resolved.
- [ ] **No PII.** No home addresses, residence-as-locator, phone/email, family details, or
      movement info for anyone — private citizen or named officer. People appear by **public role**
      and **public statement** only. (Doxxing is itself a claim in this lawsuit.)
- [ ] **Structure preserved.** You reused the file's existing table columns/format. If you touched
      `relationships.md`, you followed its header-comment node/edge format and **icon allowlist**
      (never a private citizen's photo).
- [ ] **Neutral framing.** Accusations are framed as accusations; no court had found any party
      liable or guilty as of the compilation date.

## How to open a pull request (no local setup)

### Path A — GitHub web UI (recommended; nothing to install)

1. Go to <https://github.com/sihekuang/where-is-my-lego> and click **Fork**.
2. In your fork, open the file to change (e.g. `timeline.md`) and click the **pencil / Edit** icon.
3. Make the edit in the in-browser editor, matching the existing format and the checklist above.
4. Under **Commit changes**, choose **"Create a new branch and start a pull request"**; name the
   branch something descriptive (e.g. `timeline-jun2-event`).
5. On the **Open a pull request** form (base: `sihekuang/where-is-my-lego` `main`), describe the
   change, link the source, and confirm the checklist in the PR body.

### Path B — `gh` CLI (if you have it; still no full project setup)

```bash
gh repo fork sihekuang/where-is-my-lego --clone   # fork (clone optional)
# edit the root .md file, then:
gh pr create --repo sihekuang/where-is-my-lego --base main \
  --title "docs(timeline): add <event>" --body "<what changed, source link, checklist>"
```

**Never push to the upstream `main` branch.** Always go through a fork and a pull request, even if
you have write access. Commit messages follow Conventional Commits, e.g.
`docs(timeline): add Jun 2 2026 video (ALLEGATION; sourced; no PII)`.

## Corrections

Found an error? Per [`DISCLAIMER.md`](./DISCLAIMER.md), correct it **against a primary source** and
cite that source in your PR. When a primary record contradicts an aggregator, prefer the primary
record and note the discrepancy with a `⚠`.
