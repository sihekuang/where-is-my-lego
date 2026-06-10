# Translations (i18n)

How the multilingual viewer works, and how to run translations. **This is the canonical
how-to** — `CLAUDE.md` and `CONTRIBUTING.md` point here.

The site is multilingual **without parallel source files**. You author content **once** in
English (the root Markdown), and every other language is **machine-translated at build time,
committed, and human-reviewed**. There is no hand-maintained Spanish or Chinese copy of the
archive — only generated overlays plus your review fixes on top.

---

## TL;DR — the two things you'll actually do

**1. You edited/merged English content** → refresh the translations:

```bash
cd web
node --env-file=.env scripts/translate.mjs   # re-translates ONLY what changed
git add i18n && git commit                    # commit the updated translations
```

**2. You want to add a new language** → see [Adding a language](#adding-a-language). It's ~2
config lines + the seed command + a short review pass.

> ⚠️ Use `node --env-file=.env scripts/translate.mjs`, **not** `npm run translate`. The npm
> script doesn't load `.env`, so the API key won't reach the translator. (`npm run translate`
> works only if `ANTHROPIC_API_KEY` is already exported in your shell.)

---

## Mental model

```
root *.md ──derive──► .generated/{content,data}  (English, canonical)
                              │
                              ├─ scripts/translate.mjs  (Claude, build-time, ONE-TIME per change)
                              ▼
                   i18n/<locale>/{content,data} + i18n/ui/<locale>.json  (committed translations)
                              │
                              ▼
                   lib/overlay.ts  ──►  render: translation per unit, English fallback if missing
```

- **English is the single source.** It lives in the root Markdown and is read from
  `.generated/` (produced by `npm run derive`). There is **no `i18n/en/` content directory** —
  English never needs an overlay. (The one exception is `i18n/ui/en.json`, which is the
  hand-authored source for UI chrome strings — see below.)
- **Translations are generated once per change, committed, and reviewed.** They are *not*
  produced on every build and *not* generated in the request path.
- **Rendering merges per unit.** `lib/overlay.ts` overlays the translation onto the canonical
  English; any unit with no translation falls back to English. So a missing or stale
  translation degrades to English — **the site never breaks**.

---

## What gets translated (and what doesn't)

| Source | Translated into | Notes |
|---|---|---|
| `.generated/content/*.md` (6 prose docs) | `i18n/<loc>/content/*.md` | `home`, `disclaimer`, `lawsuit`, `lawsuit-documents`, `police`, `community-sources`. Set in `PROSE_DOCS` in `translate.mjs`. |
| `.generated/data/*.json` (timeline, relationships, parties, media) | `i18n/<loc>/data/*.json` | Per-cell / per-label / per-node / per-edge. |
| `i18n/ui/en.json` (UI chrome dict) | `i18n/ui/<loc>.json` | Nav, buttons, banners, status words, table headings. |

**Never translated** (so interactive features work in every locale): event **status**
(CONFIRMED/ALLEGATION/Reported — drives filtering and styling), **sort keys / dates**, node
**ids**, and **links**. These are locale-independent by design.

---

## Drift detection — why your hand-fixes survive

Each target locale has `i18n/<loc>/_translation-manifest.json`. It stores a **SHA-256 of the
English source** for every unit (keyed `prose:<file>#<section>` — one unit per `## ` section
block, so editing one section of a long doc re-translates only that section — plus `ui:<key>`
and per-row/node/edge for data). On a seed:

- If a unit's **English hash is unchanged** *and* a prior translation exists → **reuse the
  prior translation verbatim.**
- Otherwise → re-translate that one unit.

Because the manifest hashes the **English source** (not the translation), **editing a
translation by hand never marks it stale.** Your review fixes are *drift-durable* — they
survive every future re-seed until the English they correspond to actually changes. This is why
the workflow is **auto-seed → commit → review**, and the review only ever needs to look at the
units that changed. Prose section units make this protection finer-grained: a hand-fix in one
section now survives even when *another* section of the same document is re-translated.
(Caveat: prose sections pair positionally — like table rows, **append new `## ` sections at
the end** of a doc; a mid-doc insert shifts later indices and re-translates them.)

Seeding translates stale units **a few at a time** (default 4 concurrent requests after a
cache-warming first call per request type; tune with `TRANSLATE_CONCURRENCY=<n>`).

Check drift without translating (no API key needed):

```bash
npm run translate:check          # lists stale/missing units per locale; warns, exits 0
node scripts/translate.mjs --check --strict   # same, but exits 1 on drift (use in CI)
```

> **Build behavior:** `prebuild` runs `derive` then `translate:check` (the **non-strict**
> form). Drift makes the build **warn, not fail** — missing units render as English fallback.
> If you want CI to *block* on drift, run the `--strict` form yourself.

---

## Day-to-day: content changed

After editing root Markdown (or merging a PR that did), and running `npm run derive`:

```bash
cd web
node --env-file=.env scripts/translate.mjs
```

The seed re-translates **only the drifted units, across all target locales at once**, and
reuses everything else. Then:

```bash
git add i18n && git commit -m "i18n(web): translate <what changed>"
```

**Cost:** the seed calls the Anthropic API (`claude-sonnet-4-6`) and is billed to **your API
account** (separate from any Claude Code session). It scales with the **size of the change**,
not the whole archive — a few new timeline rows is a few units, not 300. A brand-new language
is a full archive (~340 units).

---

## Adding a language

Worked example: how `zh-Hant` (Traditional Chinese) was added.

**1. Register the locale** — `lib/locales.mjs`, one line in `LOCALES`:

```js
{ code: "zh-Hant", endonym: "繁體中文", hreflang: "zh-Hant", ogLocale: "zh_TW",
  dir: "ltr", isCJK: true, ogFont: "Noto Sans TC" },
```

- `endonym` is the language's own name (shown in the switcher).
- `hreflang` is script/region-based (`zh-Hant`, `es-US`, …) for SEO alternates.
- `isCJK: true` makes OG images fetch a CJK font; `ogFont` is the Google Fonts family
  (`Noto Sans SC` for Simplified, `Noto Sans TC` for Traditional). **Latin languages set
  neither** (`isCJK: false`, no `ogFont`).

**2. Set the translation register** — `lib/translate-anthropic.mjs`, one entry in `LANG`:

```js
"zh-Hant": "Traditional Chinese (繁體中文, Taiwan terminology — 臺灣正體 …)",
```

Be explicit about the **variety** (e.g. *US Spanish*, *Taiwan Traditional*) — it changes
vocabulary and is the difference between a good and a mediocre seed.

**3. (CJK only) Confirm the OG font.** Latin scripts need **zero** font work. CJK needs the
right `ogFont` (step 1) — `lib/og-image.tsx`'s `loadOgCjkFont(title, tagline, family)` fetches
a text-subset of that family at request time. RTL would additionally need `<html dir>` wiring
(the `dir` field exists in the registry but isn't applied yet — no RTL locale exists today).

**4. Seed + verify:**

```bash
node --env-file=.env scripts/translate.mjs   # full archive for the new locale
npm test && npx tsc --noEmit && npm run lint && npm run build   # all gates
```

`build` should emit `/<locale>/*` SSG routes for every page. Then do the [review
pass](#the-review-pass) and commit.

That's it — no new pages, components, or routes. `[locale]` routing, the switcher, sitemap,
hreflang, and OG all pick the locale up from the registry automatically.

---

## The review pass

Machine output is **~90% good** — grammatical, correct terminology, markup preserved — but
needs a human (or agent) skim of the **changed units** before it's trustworthy. Anyone fluent
can do it; it isn't specialized work. The recurring nits are predictable:

| Nit | Why it happens | Fix |
|---|---|---|
| `Confirmed` / `Allegation` left as uppercase `CONFIRMED` / `ALLEGATION` in prose/labels | The prompt protects the literal legal tokens; it bleeds onto the ordinary title-case/adjective words | Translate them (es `Confirmada`/`Alegación`, zh `已确认`/`指控`). **Exceptions kept uppercase:** the read-only **banner**, and the README/home definitional blockquote (the English there *is* uppercase by design). |
| Proper nouns / company names translated (`Baker Bricks` → `贝克砖业`, `Bricks & Minifigs` → …) | The model over-translates brand names | Keep brand/company/person names in English. (Well-known **news outlet** names *are* translated by convention in the zh media table — `盐湖城论坛报` = Salt Lake Tribune.) |
| **`American Fork` transliterated (`美國福克`); `AFPD`/`AF` expanded to the wrong agency** (Air Force `空軍`, Afghan `阿富汗`, Armed Forces `武装部队`, even `人民党`) | A context-free short field (e.g. role `"AFPD detective"`) gives the model nothing to anchor the acronym, so it guesses | **Now guarded by the [protected-terms glossary](#protected-terms-glossary)** — the prompt pins these and `npm test` *fails* if a forbidden rendering is committed. Keep `American Fork` and `AFPD` Latin. |
| Same person rendered two ways in **graph vs roster** | `/parties` graph reads `relationships.json`; the roster reads `parties.json` — two independent passes | When hand-fixing a name/role, fix it in **both** files (and cross-refs in other nodes' statements). |
| Stray English / mistranslation | Normal MT error | Fix the specific string. |

**Where to fix:**
- UI strings → `i18n/ui/<loc>.json`
- Data (table cells, graph nodes/edges) → `i18n/<loc>/data/*.json`
- Prose → `i18n/<loc>/content/*.md`

All fixes are **drift-durable** (see [drift detection](#drift-detection--why-your-hand-fixes-survive)) — they won't be clobbered by future seeds. After fixing, re-run
`npm run translate:check` (should report 0 stale — hand-edits don't create drift) and `npm test`.

---

## Protected-terms glossary

`web/lib/glossary.mjs` is the single source of truth for archive-specific proper nouns and the
case-sensitive status tokens the translator keeps mangling on re-seed (e.g. `American Fork` →
`美國福克`, `AFPD detective` → "Air Force ... detective"). One list, wired three ways:

1. **Prevention** — `glossaryPromptBlock(locale)` is appended to every translator prompt
   (`document` / `fragment` / `ui`), so seeds get the terms right.
2. **Warning** — `npm run translate:check` scans the committed translations and warns (non-fatal,
   like drift) on any forbidden rendering.
3. **Hard gate** — `scripts/glossary.test.mjs` (in `npm test`) **fails** if a committed
   translation contains a forbidden term, so a bad re-seed is caught before commit. No API key
   needed (pure string scan).

**To add a protected term**, add one entry to `PROTECTED_TERMS`:

```js
{
  term: "American Fork",
  instruction: 'Keep "American Fork" (a Utah city) in Latin — never transliterate.',
  forbid: { "zh-Hans": ["美国福克"], "zh-Hant": ["美國福克"] },  // optional: per-locale outputs that are ALWAYS wrong
}
```

`instruction` shows in the prompt for all locales; `forbid` (optional) lists per-locale substrings
that are never correct in this archive — those become the detector for the warning + the failing
test. Omit `forbid` for terms with no reliable single-substring signal (the prompt still carries
the rule). Fast manual detector: `grep -rl '美國福克\|空軍\|阿富汗' web/i18n/*/data`.

---

## Guardrails

- **`web/.env` holds `ANTHROPIC_API_KEY` and is gitignored. Never commit it; never print the
  key.** Only `scripts/translate.mjs` (the seed) needs it — it lazy-imports the SDK, so
  `derive`, `build`, `test`, and `translate:check` run **without** a key.
- **Translations are committed artifacts.** Don't `.gitignore` `i18n/<loc>/` — the build reads
  them; CI does not (and should not) call the API.
- **Don't hand-edit `_translation-manifest.json`.** It's regenerated by the seed; editing it
  defeats drift detection.

---

## Tests

`npm test` includes the i18n suite:

- `scripts/translate.test.mjs` — hashing, drift diff, reuse, prose/ui/structured seeding, and
  locale-registry assertions (pure, no API).
- `scripts/i18n-ui.test.mjs` — every `i18n/ui/<loc>.json` matches `en.json`'s key set and
  preserves markup parity (`{tokens}`, `**bold**`, the CONFIRMED/ALLEGATION literals).
- `scripts/overlay.test.mjs` — overlay merge + English fallback.
- `scripts/glossary.test.mjs` — the [protected-terms glossary](#protected-terms-glossary): prompt
  block + detector unit tests, and a scan that **fails** if any committed translation contains a
  forbidden rendering (transliterated `American Fork`, `AFPD`-as-Air-Force, Best→Best Buy, etc.).
