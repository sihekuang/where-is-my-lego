/**
 * Canonical Lego-brick artwork for the social card, as an inline SVG string.
 *
 * A card-tuned copy of the favicon in `app/icon.svg` with the "?" glyph removed:
 * `next/og` (Satori) does not reliably render SVG <text>, so the brick here is
 * shapes-only and the "?" is overlaid as a styled <div> in the OG card. The
 * favicon remains the single source for the actual favicon; this constant is a
 * deliberate, stable copy sized for the 1200x630 card.
 */
export const BRICK_SVG = `<svg width="320" height="320" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(-2.5,-3.5)">
    <polygon points="48,28 57,17 57,43 48,54" fill="#b06a18" stroke="#8a5212" stroke-width="0.5"/>
    <polygon points="12,28 48,28 57,17 21,17" fill="#f0a24a" stroke="#8a5212" stroke-width="0.5"/>
    <polygon points="12,28 48,28 48,54 12,54" fill="#d8862a" stroke="#8a5212" stroke-width="0.5"/>
    <ellipse cx="28.6" cy="22.1" rx="4.6" ry="2.4" fill="#c2761f"/><ellipse cx="28.6" cy="20.1" rx="4.6" ry="2.4" fill="#f4b266"/>
    <ellipse cx="44.4" cy="22.1" rx="4.6" ry="2.4" fill="#c2761f"/><ellipse cx="44.4" cy="20.1" rx="4.6" ry="2.4" fill="#f4b266"/>
    <ellipse cx="25.0" cy="26.5" rx="4.6" ry="2.4" fill="#c2761f"/><ellipse cx="25.0" cy="24.5" rx="4.6" ry="2.4" fill="#f4b266"/>
    <ellipse cx="40.8" cy="26.5" rx="4.6" ry="2.4" fill="#c2761f"/><ellipse cx="40.8" cy="24.5" rx="4.6" ry="2.4" fill="#f4b266"/>
  </g>
</svg>`;

/** `BRICK_SVG` as a URL-encoded data URI, safe for an `<img src>` in next/og. */
export const brickDataUri = `data:image/svg+xml,${encodeURIComponent(BRICK_SVG)}`;
