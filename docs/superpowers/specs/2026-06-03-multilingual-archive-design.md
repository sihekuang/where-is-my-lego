# Multilingual Archive — Design Spec

**Date:** 2026-06-03
**Status:** Approved (brainstorming) → ready for implementation plan
**Scope of this iteration:** Simplified Chinese (`zh-Hans`) only, as a quality/performance test. Architecture is **locale-generic** so `es`, `fr`, `de`, `da`, and `zh-Hant` later become a config change, not a rewrite.

---

## 1. Goal

Make the archive readable in other languages **without maintaining a parallel set of source documents**. The root `.md` files (`README.md`, `timeline.md`, `parties.md`, `relationships.md`, `police-controversy.md`, `DISCLAIMER.md`, `lawsuit/*.md`, `media/*.md`) stay the **single authored source of truth, in English**. Every other language is a *generated-then-reviewed* artifact.

Non-negotiable for this archive: translation must not alter legal meaning. The record deliberately labels every claim **CONFIRMED** vs **ALLEGATION**, takes an explicit anti-defamation stance, and avoids adjudication. Translations inherit those constraints.

## 2. The constraint that drives the design

`web/scripts/derive-data.mjs` depends on **canonical English tokens**:

- `classifyStatus()` greps text for `CONFIRMED` / `ALLEGATION`.
- `parseDateKey()` parses English month names and `early/late/mid/end/as of`.
- The relationship graph validates enums (`person|org|agency`, `plaintiff|defendant|official|neutral`, `legal|corporate|familial|transactional|investigative|law-enforcement`, direction `→|↔|—`, status `CONFIRMED|ALLEGATION`) and uses stable node `id`s as join keys.

Therefore: **derive structure from English exactly once; translate only the human-readable display strings.** Status filtering, timeline sorting, and the graph then work identically in every locale because they read canonical fields, never translated text.

This is why **Approach A (translate the display layer)** was chosen over translating raw `.md` and re-running the pipeline per locale (which would break status classification, date parsing, and enum validation, and force date-parsing in N languages).

## 3. Architecture overview

```
root *.md  ──derive-data.mjs──▶  web/.generated/   (English canonical: structured JSON + prose; gitignored)
                                      │
                                      ▼
                              translate.mjs (Claude, build-time)
                                      │
                                      ▼
                          web/i18n/<locale>/         (committed, reviewable)
                            content/*.md             translated prose
                            data/*.json              translated DISPLAY strings only
                            _translation-manifest.json   per-unit source hashes
                          web/i18n/ui/<locale>.json  UI-chrome strings

Next app (app/[locale]/…) reads:  .generated/ (canonical) + i18n/<locale>/ (overlay)  →  per-locale pages
```

English is **not** stored under `web/i18n/` — it stays the canonical source. The root archive stays pristine (English-only), honoring "keep the same set of readmes."

## 4. Components

### 4.1 Locale config — `web/lib/locales.mjs`
Zero-dependency ES module, the single source of truth for the locale set, imported by **both** the build scripts (plain Node) and the Next app (TS imports `.mjs` fine).

Exports (shape):
- `DEFAULT_LOCALE = "en"`
- `LOCALES` — ordered list of locale objects: `{ code, endonym, hreflang, dir: "ltr", isCJK }`. This iteration ships `en` (canonical, not translated) + `zh-Hans` (`endonym: "简体中文"`, `hreflang: "zh-Hans"`, `isCJK: true`).
- `TARGET_LOCALES` — locales that get translated (everything except `en`).
- Helpers: `isLocale(code)`, `localeOr404(code)`.

Adding a language later = appending one object here.

### 4.2 Translation pipeline — `web/scripts/translate.mjs`
Runs **after** `derive-data.mjs`, consuming `web/.generated/` (English structure already fixed).

For each `TARGET_LOCALES` entry:

- **Prose docs** (`home.md`, `disclaimer.md`, `lawsuit.md`, `lawsuit-documents.md`, `police.md`, `media-manifest.md`): translate the whole markdown document. Instruction set: preserve markdown structure, links/URLs, case numbers, proper names, and quoted text verbatim; translate surrounding prose only.
- **Structured data** (`timeline.json`, `parties.json`, `relationships.json`, `media-news.json`, `media-primary.json`): translate **only** display strings:
  - table **column headers** and human-readable **cell prose**,
  - graph node `label`, `role`, `statement`; edge `label`, `note`.
  - **Left canonical (never sent for free translation):** `status`, `sort`, node `id`, `type`/`side`/`category`/`direction`, edge `status`, `ini`, all links, all dates, case numbers.
  - The Status column's *visible label* is rendered from the **UI dictionary** keyed by canonical `status` (e.g. `confirmed → 已确认`), not free-translated, so it stays consistent and the filter keeps using canonical `status`.
  - Output mirrors the canonical shape but carries only translated strings, aligned by index / id, to be overlaid at render time.

**Engine:** `@anthropic-ai/sdk` (new **devDependency** — build-time only, never in the request path), model `claude-sonnet-4-6`, key from `ANTHROPIC_API_KEY` (added to `web/.env.example`). Prompt caching on the large rules system prompt across calls. Batched per document / per table to minimize calls.

**Accuracy guard (system prompt):** do not soften, strengthen, or adjudicate any claim; preserve the CONFIRMED vs ALLEGATION distinction; add no facts; keep names, quotes, and legal terms exact; output valid markdown/JSON only.

**Injectable translator:** `translate.mjs` exports its pure transform functions taking an injected `translate(text, targetLocale) → string` so tests run **offline with a fake translator** (mirrors the existing `derive-data.test.mjs` `opts.md` injection pattern). The real Anthropic call lives behind that seam.

### 4.3 Drift detection & incremental seeding
Each locale has `web/i18n/<locale>/_translation-manifest.json` storing a **per-unit source hash** (SHA-256): one per prose doc, one per table row, one per graph node, one per graph edge.

- `pnpm translate` (manual seed/update; calls API): for each unit, compute current English source hash; **unchanged → skip** (cached; prior human corrections to that unit survive); **changed or missing → re-translate just that unit** and update its hash.
- `pnpm translate:check` (CI / `prebuild`; **no API calls**): **warns and exits 0** when any committed unit's stored hash ≠ current English source hash — i.e. a translation went stale. It is non-fatal by design: the render layer already falls back to English per-unit (§4.5), so a content edit never blocks a deploy. It prints the list of stale units so a `pnpm translate` re-seed can be run before the next release. (A `--strict` flag exits non-zero for anyone who wants a hard gate.)

Per-unit (not per-file) hashing is what makes "auto-seed + commit + **review**" real: you review the git diff, and editing one row never gets clobbered when an unrelated row's English changes.

### 4.4 Storage — `web/i18n/` (committed)
```
web/i18n/
  zh-Hans/
    content/home.md disclaimer.md lawsuit.md lawsuit-documents.md police.md media-manifest.md
    data/timeline.json parties.json relationships.json media-news.json media-primary.json
    _translation-manifest.json
  ui/
    zh-Hans.json     # nav, card titles/descriptions, banner, footer, status labels, switcher, etc.
```
Committed and hand-editable. (`web/.generated/` stays gitignored; `web/i18n/` is tracked.)

### 4.5 Web app — `[locale]` routing
Move pages under `app/[locale]/…` with `generateStaticParams()` over `LOCALES` (stays fully static / SSG, preserving current SEO + OG behavior).

- `/` redirects to `/en`; every locale is path-prefixed (`/en/timeline`, `/zh-Hans/parties`).
- `app/[locale]/layout.tsx` sets `<html lang={locale}>`, selects the font stack (§4.7), and exposes the active locale + a `t()` helper to the tree.
- `web/lib/content.ts` gains a `locale` param. For `en`: read `.generated/` as today. For a target locale: read the canonical `.generated/` record and **overlay** the translated display strings from `web/i18n/<locale>/`, **falling back to English per-unit** when a unit is missing or stale. Status filter and timeline sort always use canonical fields.
- UI chrome (currently hardcoded English in `layout.tsx` NAV, the CONFIRMED/ALLEGATION banner, the footer, and `app/page.tsx` card titles/descriptions) reads from `web/i18n/ui/<locale>.json` via `t()`.

### 4.6 Language switcher
A header control next to the existing `ModeToggle`, reusing the same dropdown primitive `ModeToggle` uses. Lists endonyms (`English`, `简体中文`) and links to the **same pathname** under the new locale prefix.

### 4.7 Fonts (CJK)
Add `Noto_Sans_SC` via `next/font/google`, loaded **only** when `locale.isCJK` (conditional in `[locale]/layout.tsx`) so Latin readers never download CJK fonts. The "brick" display font (`Bricolage_Grotesque`) has no CJK glyphs, so Chinese headings gracefully fall back to the CJK sans (the playful brick treatment does not apply to CJK glyphs — accepted). The per-locale font variable is set on `<html>`/`<body>`.

### 4.8 SEO / metadata
- `<html lang>` per locale.
- `hreflang` alternates for every page × locale + `x-default → en`, via `generateMetadata`'s `alternates.languages`. `web/lib/seo.ts` `pageMetadata()` becomes locale-aware (currently hardcodes `en_US` + `canonical: path`).
- `sitemap.ts`: emit every route × locale, with alternates.
- JSON-LD (`structured-data.ts` / `JsonLd.tsx`): `inLanguage` per locale; localize embedded `name`/`description`/`headline` from the UI dict / translated prose.
- OG image title text (`opengraph-image.tsx`, per-route) localized from the UI dict (short strings — in scope).
- Per-locale self-canonical.

### 4.9 Tests / verification
- `web/scripts/translate.test.mjs` (offline, fake translator): overlay swaps display strings while preserving `status`/`sort`/`id`/enums/links; per-unit fallback to English works; drift logic marks a unit stale when its English source changes and cached when unchanged; the transform never emits a translated value into a canonical field.
- Extend `web/scripts/verify-seo.mjs` for `hreflang` presence + per-locale sitemap entries.
- Wire `translate.test.mjs` into the `test` script; wire `translate:check` into `prebuild` (after `derive`).

## 5. package.json script changes
- `"translate": "node scripts/translate.mjs"` — manual seed/update (needs `ANTHROPIC_API_KEY`).
- `"translate:check": "node scripts/translate.mjs --check"` — no API; drift gate.
- `prebuild`: `npm run derive && npm run translate:check`.
- `test`: append `&& node scripts/translate.test.mjs`.
- Add `@anthropic-ai/sdk` to `devDependencies`.

## 6. Out of scope (this iteration)
- Locales other than `zh-Hans` (config-ready, not enabled).
- Localizing dates / number formats inside table cells (dates stay as canonical English strings; sort is unaffected).
- Per-paragraph (sub-document) drift for prose — prose drift is per-document this iteration; per-row drift applies to tables/graph.
- RTL handling (none of the chosen locales are RTL).

## 7. Suggested implementation phases
1. `locales.mjs` + `translate.mjs` (**prose only**) + per-unit drift + `translate.test.mjs` (fake translator). Prove the pipeline + judge translation quality on prose.
2. Structured overlay (tables + graph) + `ui/zh-Hans.json` dictionary.
3. `app/[locale]/` routing + `content.ts` overlay/fallback + language switcher + CJK font.
4. SEO (hreflang / sitemap / JSON-LD) + OG title localization.

Each phase is independently buildable and reviewable; quality can be judged after Phase 1.

## 8. Process note
Per repo convention, spec/plan docs under `docs/superpowers/` are stripped before merge to `main` (main stays code-only). This file lives on `feat/i18n-zh-hans`.
