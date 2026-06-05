import { ImageResponse } from "next/og";
import { brickDataUri } from "./brick-svg.mjs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "Where Is My Lego";
const SUBTITLE = "BAM × Reckless Ben";

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

/** Branded social card with the Lego-brick logo. When `cjkFont` is provided, all text renders
 *  in Noto Sans SC (which covers Latin too) so Chinese titles display correctly. */
export function renderOgImage(
  title: string,
  { tagline = "Sourced Research Archive", cjkFont = null }: { tagline?: string; cjkFont?: ArrayBuffer | null } = {},
) {
  const family = cjkFont ? "NotoSC" : "sans-serif";
  const options = cjkFont
    ? { ...size, fonts: [{ name: "NotoSC", data: cjkFont, weight: 700 as const, style: "normal" as const }] }
    : size;
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#13161c",
          color: "#e6e8ec",
          padding: "80px",
          fontFamily: family,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            flex: 1,
            paddingRight: 56,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", fontSize: 34, letterSpacing: 4, color: "#4c9be6", textTransform: "uppercase" }}>
              {BRAND}
            </div>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, color: "#9aa3b2", fontWeight: 500 }}>
              {SUBTITLE}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 80, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#9aa3b2" }}>{tagline}</div>
        </div>

        <div style={{ position: "relative", display: "flex", width: 320, height: 320, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img width={320} height={320} src={brickDataUri} alt="" />
          <div
            style={{
              position: "absolute",
              left: 48,
              top: 122,
              width: 180,
              height: 130,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 112,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            ?
          </div>
        </div>
      </div>
    ),
    options,
  );
}
