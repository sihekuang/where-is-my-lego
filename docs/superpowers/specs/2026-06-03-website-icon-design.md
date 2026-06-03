# Website icon — design

**Date:** 2026-06-03
**Scope:** Add a site icon (favicon + Apple/PWA touch icon) for the BAM × Reckless Ben research archive (`web/`, Next.js 16 App Router).

## Concept

A Lego brick with a question mark on it — a literal nod to the "where is my Lego" framing of the archive.

## Visual design

- **Form:** 3D brick in cabinet projection (front face square-on, depth receding up-right). A 2×2 brick: four studs on the top face, the question mark on the front face.
- **Color (site amber — the "allegation" accent `#d8862a`):**
  - Front face `#d8862a`, top face `#f0a24a`, right face `#b06a18`
  - Stud tops `#f4b266`, stud sides `#c2761f`
  - Edge stroke `#8a5212` at 0.5px
  - Question mark: white `#ffffff`, bold
- **Geometry** authored on a `0 0 64 64` viewBox so it scales cleanly to favicon sizes (verified legible at 16px).

## Deliverables (Next.js App Router file conventions)

1. `web/app/icon.svg` — **transparent** amber brick. Next auto-emits `<link rel="icon" type="image/svg+xml">`. Used as the browser-tab favicon.
2. `web/app/apple-icon.png` — 180×180 PNG of the brick on a **dark rounded tile** (`#171a21`, the site panel color). Next auto-emits `<link rel="apple-touch-icon">`. iOS masks corners; a filled tile reads as a proper app icon (a transparent brick would not).
3. `web/scripts/icons/apple-icon.svg` + `build.sh` — source SVG for the tile and the `rsvg-convert` command that regenerates the PNG, so the icon can be recolored/rebuilt later.

The "?" is rendered with a `text` element (font stack `'Arial Black', Arial, Helvetica, sans-serif`). The browser renders the favicon glyph with whatever sans-serif it has — universally a clean "?". The PNG bakes the glyph at build time so it has no runtime font dependency.

## Out of scope (offered as follow-ups)

- Full PWA `manifest.webmanifest` with 192/512 maskable icons (Android home-screen). Current set covers desktop tabs + iOS.
- A `theme-color` meta tag.
- Converting the "?" to an outlined vector path (only needed if a non-Arial favicon rendering ever looks off).

## Verification

- Render both SVGs to PNG via `rsvg-convert` and eyeball the brick + "?".
- Run `pnpm dev` and confirm the emitted `<link rel="icon">` and `<link rel="apple-touch-icon">` tags in the page `<head>`.
