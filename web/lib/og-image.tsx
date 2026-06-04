import { ImageResponse } from "next/og";
import { brickDataUri } from "./brick-svg.mjs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND = "Where Is My Lego";
const SUBTITLE = "BAM × Reckless Ben";

/** Branded social card with the Lego-brick logo. Uses next/og's built-in font; keep text to
 *  common Latin glyphs — the "×" in the sub-title renders, but exotic glyphs may not.
 *  Pass `graphMotif` (a data URI) to replace the brick with a full-bleed graph background. */
export function renderOgImage(
  title: string,
  {
    tagline = "Sourced Research Archive",
    cjkFont = null,
    graphMotif = null,
  }: { tagline?: string; cjkFont?: ArrayBuffer | null; graphMotif?: string | null } = {},
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
          position: "relative",
        }}
      >
        {graphMotif && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img width={size.width} height={size.height} src={graphMotif} alt=""
              style={{ position: "absolute", top: 0, left: 0, width: size.width, height: size.height, objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: size.width, height: size.height,
              background: "linear-gradient(90deg,#0c0f15ee 0%,#0c0f1599 46%,#0c0f1533 80%)", display: "flex" }} />
          </>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            flex: 1,
            paddingRight: 56,
            position: "relative",
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

        {!graphMotif && (
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
        )}
      </div>
    ),
    options,
  );
}
