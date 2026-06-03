import { ImageResponse } from "next/og";
import { brickDataUri } from "./brick-svg";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social card with the Lego-brick logo. Uses the built-in font (ASCII-safe text only). */
export function renderOgImage(title: string) {
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
          background: "#0f1115",
          color: "#e6e8ec",
          padding: "80px",
          fontFamily: "sans-serif",
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
          <div style={{ display: "flex", fontSize: 34, letterSpacing: 4, color: "#6ea8fe", textTransform: "uppercase" }}>
            Where Is My Lego
          </div>
          <div style={{ display: "flex", fontSize: 80, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#9aa3b2" }}>Sourced Research Archive</div>
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
    size,
  );
}
