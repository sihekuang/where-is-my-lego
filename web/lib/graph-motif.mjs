// Standalone, ZERO-dependency graph "still" renderer. Consumes the deterministic
// node positions baked by layoutRelationships (derive-data.mjs) and emits a flat
// SVG string — no DOM, no cytoscape. Used as (a) the homepage hero's SSR / no-JS /
// reduced-motion fallback and (b) the homepage OpenGraph card. Kept as plain .mjs
// with its own palette (mirroring lib/graph-style.ts) so the zero-dep derive tests
// and Satori can both import it, exactly like lib/brick-svg.mjs.
//
// Invariant: NO <text> — Satori/resvg can't reliably render it.

// Palette mirror of lib/graph-style.ts (keep in sync; small + stable).
const CATEGORY_COLORS = {
  legal: "#e5544b",
  transactional: "#d8862a",
  familial: "#2f9e63",
  personal: "#e06aa8",
  "law-enforcement": "#22c3d6",
  corporate: "#6ea8fe",
  investigative: "#a779e6",
};

const THEME = {
  dark: { bg0: "#1a2030", bg1: "#0c0f15", nodeBg: "#1f2530", edge: "#888888",
          side: { plaintiff: "#4c9be6", defendant: "#e2614e", official: "#9aa3b2", neutral: "#9aa3b2" } },
  light: { bg0: "#f4f1ea", bg1: "#e9e3d6", nodeBg: "#ffffff", edge: "#9a8f76",
          side: { plaintiff: "#1976d2", defendant: "#d8472f", official: "#7a7059", neutral: "#7a7059" } },
};

// Node radius (px) by connection count — mirror of nodeSize() in graph-style.ts, /2.
export function nodeRadius(degree) {
  const base = 34, perEdge = 4, min = 32, max = 56;
  return Math.max(min, Math.min(max, base + degree * perEdge)) / 2;
}

export function degreeMap(edges) {
  const d = {};
  for (const e of edges) {
    d[e.source] = (d[e.source] || 0) + 1;
    d[e.target] = (d[e.target] || 0) + 1;
  }
  return d;
}

// Project each node's normalized pos → pixel coords (+ radius) inside width×height.
export function projectPositions(nodes, edges, { width, height, pad = 70 }) {
  const degrees = degreeMap(edges);
  const innerW = Math.max(1, width - pad * 2);
  const innerH = Math.max(1, height - pad * 2);
  const out = new Map();
  for (const n of nodes) {
    const p = n.pos || { x: 0.5, y: 0.5 };
    out.set(n.id, {
      x: pad + p.x * innerW,
      y: pad + p.y * innerH,
      r: nodeRadius(degrees[n.id] || 0),
      side: n.side || "neutral",
    });
  }
  return out;
}

export function buildGraphMotifSvg(data, { width, height, theme = "dark", pad = 70 } = {}) {
  const t = THEME[theme] || THEME.dark;
  const place = projectPositions(data.nodes, data.edges, { width, height, pad });

  // Declare a radial-gradient halo per side used, plus the background gradient.
  const usedSides = [...new Set(data.nodes.map((n) => n.side || "neutral"))];
  const defs =
    usedSides
      .map((side) => {
        const col = t.side[side] || t.side.neutral;
        return `<radialGradient id="halo-${side}"><stop offset="0%" stop-color="${col}" stop-opacity="0.42"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></radialGradient>`;
      })
      .join("") +
    `<radialGradient id="bg" cx="50%" cy="44%" r="75%"><stop offset="0%" stop-color="${t.bg0}"/><stop offset="100%" stop-color="${t.bg1}"/></radialGradient>`;

  const edges = data.edges
    .map((e) => {
      const a = place.get(e.source), b = place.get(e.target);
      if (!a || !b) return "";
      const col = CATEGORY_COLORS[e.category] || t.edge;
      const dash = e.status === "ALLEGATION" ? ` stroke-dasharray="7 6"` : "";
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${col}" stroke-width="2.4" stroke-opacity="0.55"${dash}/>`;
    })
    .join("");

  const halos = data.nodes
    .map((n) => {
      const p = place.get(n.id);
      return `<circle cx="${p.x}" cy="${p.y}" r="${p.r * 2.1}" fill="url(#halo-${n.side || "neutral"})"/>`;
    })
    .join("");

  const dots = data.nodes
    .map((n) => {
      const p = place.get(n.id);
      const col = t.side[n.side] || t.side.neutral;
      return `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${t.nodeBg}" stroke="${col}" stroke-width="3.5"/>`;
    })
    .join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<defs>${defs}</defs>` +
    `<rect width="${width}" height="${height}" fill="url(#bg)"/>` +
    edges + halos + dots +
    `</svg>`
  );
}

export function graphMotifDataUri(data, opts) {
  return "data:image/svg+xml," + encodeURIComponent(buildGraphMotifSvg(data, opts));
}
