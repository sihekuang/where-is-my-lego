# SEO Design — Where Is My Lego

**Date:** 2026-06-03
**Status:** Design (pending implementation plan)
**Scope:** `web/` (the Next.js read-only viewer). No changes to the canonical root Markdown.

## Goal

Maximize legitimate discoverability of the archive while keeping all copy and
structured data factually accurate. The site documents a real dispute naming
identifiable people; metadata and JSON-LD must describe the archive pages
truthfully (allegations labeled as allegations) — they must never assert
contested claims as fact.

## Decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Indexing posture | Maximize discoverability (allow-index, aggressive snippet/image hints) |
| Canonical base URL | `https://www.whereismylego.com` (apex 308-redirects to `www`) |
| Brand in titles/OG | **"Where Is My Lego"** — lead with the domain brand; topic names ("BAM × Reckless Ben") live in descriptions/body only |
| OG image | Dynamic per-page (Next `ImageResponse`) |
| Structured data | Rich + accurate: `WebSite` + `Organization` sitewide; `Article` + `BreadcrumbList` per content page |

## Architecture

A single SEO module owns all config and the per-page metadata helper. Page
files stay declarative (one helper call + one structured-data component).
Next.js file-convention routes (`sitemap.ts`, `robots.ts`, `manifest.ts`,
`opengraph-image.tsx`, `icon.svg`) handle the rest — Next auto-emits the
correct `<link>`/`<meta>` tags and serves the files.

### Components

**`web/lib/seo.ts`** — single source of truth.
- `SITE_URL` = `(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.whereismylego.com")` with any trailing slash stripped.
- `SITE_NAME` = `"Where Is My Lego"`.
- `DEFAULT_DESCRIPTION` — the existing site description.
- `pageMetadata({ title, description, path })`: returns a Next `Metadata` object with `title` (composed by the root template), `description`, `alternates.canonical = path`, and `openGraph`/`twitter` title+description+url. Does NOT set images — Next associates the route's `opengraph-image` automatically.
- What it depends on: nothing app-specific; pure function over its args + `SITE_URL`/`SITE_NAME`.

**`web/app/layout.tsx`** — root metadata (expanded):
- `metadataBase: new URL(SITE_URL)`
- `title: { default: "Where Is My Lego — Sourced Research Archive", template: "%s · Where Is My Lego" }`
- `description: DEFAULT_DESCRIPTION`
- `applicationName: SITE_NAME`
- `alternates: { canonical: "/" }`
- `openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", url: "/", title, description }`
- `twitter: { card: "summary_large_image", title, description }`
- `robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }`
- Renders the sitewide JSON-LD (`WebSite` + `Organization`) in `<body>`.
- Icons/manifest/OG image are picked up via file conventions (no explicit `icons`/`manifest` keys needed).

**Per-page metadata** — each `app/**/page.tsx` replaces its bare `title` export with `export const metadata = pageMetadata({ title, description, path })` and renders `<PageStructuredData ... />`. Titles drop "— BAM × Reckless Ben" (now supplied by the template); the topic name moves into each description.

| Route | Title (renders as `… · Where Is My Lego`) | Description (factual) |
|---|---|---|
| `/` | (root default) "Where Is My Lego — Sourced Research Archive" | Existing site description |
| `/timeline` | Timeline | Chronological record (2023–2026) of the Bricks & Minifigs (BAM) – Reckless Ben dispute: consignment, repossession, arrests, search warrant, Utah lawsuit — each entry labeled Confirmed or Allegation. |
| `/parties` | Parties | The people and entities in the BAM – Reckless Ben dispute, described only by their public roles and publicly reported statements. |
| `/lawsuit` | Lawsuit | The Utah 4th District civil case — 13 causes of action — with how to obtain the primary filings. |
| `/lawsuit/documents` | Court Documents | How to obtain the primary court filings for the BAM – Reckless Ben case. |
| `/police` | Police Controversy | Documented arrests, the search warrant, and the American Fork PD response — labeled Confirmed or Allegation. |
| `/media` | Media Catalog | Cataloged (not re-hosted) news, videos, and statements covering the controversy, with source links. |
| `/disclaimer` | Disclaimer | Scope, methodology, sourcing, and limitations of this read-only archive. No court has found any party liable. |

**`web/app/sitemap.ts`** — `MetadataRoute.Sitemap` for all 8 routes. `lastModified` per route derived from the mtime of that route's generated artifact in `web/.generated/` (always produced by the `derive` prebuild step), falling back to build time. `changeFrequency`/`priority`: home `1.0/weekly`, timeline+police `0.9/weekly`, lawsuit+parties+media `0.8/weekly`, lawsuit/documents+disclaimer `0.5/monthly`.

**`web/app/robots.ts`** — `MetadataRoute.Robots`: `rules: { userAgent: "*", allow: "/" }`, `sitemap: ${SITE_URL}/sitemap.xml`, `host: SITE_URL`.

**`web/lib/og-image.tsx`** — shared `ImageResponse` renderer `renderOgImage(title)` plus exported `size = { width: 1200, height: 630 }` and `contentType = "image/png"`. Dark card matching the site theme: brand "Where Is My Lego", the page title large, "Sourced Research Archive" subtitle. Uses a bundled/standard font to avoid network fetches at build; ASCII-safe text (no `×` glyph).
- `web/app/opengraph-image.tsx` (root) → `renderOgImage("Sourced Research Archive")`.
- One thin `app/<route>/opengraph-image.tsx` per content route: `export { size, contentType } from "@/lib/og-image"` + `export default () => renderOgImage("<Page Title>")`.

**`web/lib/structured-data.ts`** + **`web/components/JsonLd.tsx`**:
- `JsonLd` — server component rendering `<script type="application/ld+json">` with a sanitized JSON payload.
- `siteJsonLd()` — `@graph` of `WebSite` (name, url) and `Organization` (name, url, logo = the icon). Rendered once in `layout.tsx`.
- `PageStructuredData({ title, description, path, dateModified })` — renders `Article` (headline = title, description, `dateModified` from the route's generated-artifact mtime, `inLanguage: "en"`, `isPartOf` = the `WebSite`, `publisher` = the `Organization`, `mainEntityOfPage` = canonical) + `BreadcrumbList` (Home → page). `datePublished` is omitted (no reliable per-page publish date — do not fabricate one). Headlines/descriptions are neutral and never assert contested claims as fact.

**`web/app/manifest.ts`** — minimal `MetadataRoute.Manifest`: name, short_name "Where Is My Lego", `start_url: "/"`, `display: "standalone"`, theme/background colors from `globals.css`, icons referencing `app/icon`.

**`web/app/icon.svg`** (+ `apple-icon`) — a simple brand mark (magnifying glass over a brick silhouette), dark-theme friendly. Placeholder-quality, easy to swap later. Next derives the favicon from it.

### Environment

`NEXT_PUBLIC_SITE_URL=https://www.whereismylego.com` set in the Vercel project (Production + Preview). Local/dev and any unset environment fall back to the same value via the default in `seo.ts`, so nothing breaks without the env var. A `.env.example` documents it.

## Data flow

1. Build runs `derive` → `web/.generated/` content + data.
2. `sitemap.ts`/`robots.ts`/`manifest.ts`/`opengraph-image.tsx`/`icon.svg` are evaluated at build (all routes static) → emitted as static assets; Next injects the corresponding tags.
3. Each page exports `pageMetadata(...)` → Next renders `<title>`, canonical, OG, Twitter tags resolved against `metadataBase`.
4. `layout.tsx` injects sitewide JSON-LD; each page injects its `Article` + `BreadcrumbList` JSON-LD.

## Accuracy & safety guardrails

- Descriptions and JSON-LD describe the *archive pages*, not verdicts. Allegations stay labeled; nothing asserts criminal liability as fact (consistent with the disclaimer).
- `Article` schema uses neutral headlines; no `NewsArticle`/`ClaimReview` that would imply a publisher verdict.

## Testing / verification

The project has no TS unit-test runner; verification mirrors the existing lightweight, end-to-end style:
- `web/scripts/verify-seo.mjs` — run against a built+started server: asserts `/robots.txt` allows `/` and references the sitemap; `/sitemap.xml` lists all 8 absolute `https://www.whereismylego.com` URLs; the home and a content page expose `<link rel="canonical">`, `og:title`, `og:image`, `twitter:card`, and `application/ld+json` containing `WebSite` and `Article`.
- `pnpm build` must succeed (Turbopack) with all routes static and the OG image routes generated.
- Manual: validate one page in a rich-results / OG debugger.

## Files

**Add:** `web/lib/seo.ts`, `web/lib/og-image.tsx`, `web/lib/structured-data.ts`, `web/components/JsonLd.tsx`, `web/app/sitemap.ts`, `web/app/robots.ts`, `web/app/manifest.ts`, `web/app/icon.svg`, `web/app/apple-icon.*`, `web/app/opengraph-image.tsx` + 7 per-route `opengraph-image.tsx`, `web/scripts/verify-seo.mjs`, `web/.env.example`.

**Change:** `web/app/layout.tsx` (root metadata + sitewide JSON-LD), all 7 content `page.tsx` (+ home) to use `pageMetadata` and `PageStructuredData`.

**Out of scope:** custom-domain/DNS setup (already done), analytics, multi-language, RSS.
