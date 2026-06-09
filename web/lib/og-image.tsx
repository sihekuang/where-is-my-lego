import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "Where Is My Lego";
const SUBTITLE = "BAM × Reckless Ben";

// The hero photo (1200×630 JPEG in /public), read once from disk at build and inlined as a
// data URI so next/og can composite it. Cached across the per-page OG routes.
let heroUri: string | null = null;
function heroBackground(): string {
  if (heroUri) return heroUri;
  const buf = readFileSync(join(process.cwd(), "public", "og-hero.jpg"));
  heroUri = `data:image/jpeg;base64,${buf.toString("base64")}`;
  return heroUri;
}

// Fetched CJK font buffers are cached per character-subset so repeated OG routes
// (one per page) don't refetch. Build-time only; failures fall back gracefully.
const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

/** Fetch a CJK font subset covering exactly the glyphs on the card. `family` is a Google Fonts
 *  family name (e.g. "Noto Sans SC" for Simplified, "Noto Sans TC" for Traditional) so each
 *  locale renders with the correct regional glyphs. Returns null on any failure so OG generation
 *  never breaks the build (the card just renders without CJK). */
export function loadOgCjkFont(title: string, tagline: string, family = "Noto Sans SC"): Promise<ArrayBuffer | null> {
  // Include the Latin brand lines too: when `fonts` is supplied it replaces next/og's
  // built-in font, so the subset must cover every glyph drawn on the card.
  const chars = [...new Set(`${BRAND}${SUBTITLE}? ${title}${tagline}`)].join("");
  // Key the cache by family too, so the SC and TC subsets never collide.
  const cacheKey = `${family}:${chars}`;
  if (fontCache.has(cacheKey)) return fontCache.get(cacheKey)!;
  const p = (async () => {
    try {
      const api = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@700&text=${encodeURIComponent(chars)}`;
      const css = await (await fetch(api, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      })).text();
      const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
      if (!url) return null;
      return await (await fetch(url)).arrayBuffer();
    } catch {
      return null;
    }
  })();
  fontCache.set(cacheKey, p);
  return p;
}

/** Branded social card: the cinematic hero photo with a dark scrim and the page title centered
 *  over it. When `cjkFont` is provided, all text renders in Noto Sans (which covers Latin too)
 *  so Chinese titles display correctly. */
export function renderOgImage(
  title: string,
  { tagline = "Disputed ~$200K LEGO collection", cjkFont = null }: { tagline?: string; cjkFont?: ArrayBuffer | null } = {},
) {
  const family = cjkFont ? "NotoSC" : "sans-serif";
  const options = cjkFont
    ? { ...size, fonts: [{ name: "NotoSC", data: cjkFont, weight: 700 as const, style: "normal" as const }] }
    : size;
  // Avoid showing the same line twice on the home card (where title === tagline).
  const sub = tagline && tagline !== title ? tagline : SUBTITLE;
  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", position: "relative", fontFamily: family }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={1200}
          height={630}
          src={heroBackground()}
          alt=""
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* dark scrim for legibility */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background: "linear-gradient(180deg, rgba(8,10,14,0.55) 0%, rgba(8,10,14,0.78) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "72px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: "#f0b45a", textTransform: "uppercase", fontWeight: 700 }}>
            {BRAND}
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#ffffff", lineHeight: 1.05, marginTop: 20, maxWidth: 1000 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#cdd3dd", marginTop: 20, letterSpacing: 2 }}>
            {sub}
          </div>
        </div>
      </div>
    ),
    options,
  );
}
