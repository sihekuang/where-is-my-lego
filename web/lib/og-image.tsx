import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social card. Uses the built-in font (ASCII-safe text only). */
export function renderOgImage(title: string) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f1115",
          color: "#e6e8ec",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 4, color: "#6ea8fe", textTransform: "uppercase" }}>
          Where Is My Lego
        </div>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#9aa3b2" }}>Sourced Research Archive</div>
      </div>
    ),
    size,
  );
}
