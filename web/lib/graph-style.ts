import type cytoscape from "cytoscape";
import type { StylesheetStyle } from "cytoscape";
import type { GraphNode } from "@/lib/content";

export const CATEGORY_COLORS: Record<string, string> = {
  legal: "#e5544b",
  transactional: "#d8862a",
  familial: "#2f9e63",
  "law-enforcement": "#22c3d6",
  corporate: "#6ea8fe",
  investigative: "#a779e6",
};

export type Theme = "light" | "dark";

type Side = GraphNode["side"];

// Ring/halo colors per theme — brighter on the baseplate, legible on paper.
export const SIDE_PALETTE: Record<Theme, Record<Side, string>> = {
  light: { plaintiff: "#1976d2", defendant: "#d8472f", official: "#7a7059", neutral: "#7a7059" },
  dark:  { plaintiff: "#4c9be6", defendant: "#e2614e", official: "#9aa3b2", neutral: "#9aa3b2" },
};

export type GlowParams = {
  haloBlur: number;        // px halo reach beyond the node radius (at zoom 1)
  haloOpacity: number;     // inner halo alpha
  edgeGlowBlur: number;    // px blur on edge underglow
  edgeGlowAlpha: number;   // edge underglow alpha
  vignette: boolean;       // darken canvas edges (dark only)
  dropShadow: { dy: number; blur: number; color: string } | null; // light-mode depth
  pulseAmp: number;        // extra halo fraction at pulse peak
  dashSpeed: number;       // px/sec for the allegation dash-flow
};

export const GLOW_PARAMS: Record<Theme, GlowParams> = {
  dark:  { haloBlur: 16, haloOpacity: 0.55, edgeGlowBlur: 8, edgeGlowAlpha: 0.40, vignette: true,  dropShadow: null, pulseAmp: 0.25, dashSpeed: 26 },
  light: { haloBlur: 12, haloOpacity: 0.20, edgeGlowBlur: 6, edgeGlowAlpha: 0.16, vignette: false, dropShadow: { dy: 2, blur: 4, color: "rgba(58,51,32,0.22)" }, pulseAmp: 0.18, dashSpeed: 26 },
};

// Node diameter (px) scaled by connection count: hubs read larger, leaves stay legible.
export function nodeSize(degree: number): number {
  const base = 34, perEdge = 4, min = 32, max = 56;
  return Math.max(min, Math.min(max, base + degree * perEdge));
}

// "#rrggbb" (or "#rgb") + alpha → "rgba(...)" for canvas fills.
export function withAlpha(hex: string, a: number): string {
  const m = hex.replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(v.slice(0, 2), 16), g = parseInt(v.slice(2, 4), 16), b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a))})`;
}

export const SIDE_COLORS: Record<string, string> = {
  plaintiff: "#4a6a9e",
  defendant: "#a85a55",
  official: "#6b7280",
  neutral: "#6b7280",
};

export function initialsHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

// A self-contained SVG initials avatar as a data URI (used when a node has no icon).
export function initialsDataUri(ini: string, label: string): string {
  const hue = initialsHue(label);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>` +
    `<rect width='80' height='80' fill='hsl(${hue},24%,20%)'/>` +
    `<text x='40' y='40' font-family='ui-sans-serif,system-ui,sans-serif' font-size='30' ` +
    `font-weight='700' fill='#dfe4ec' text-anchor='middle' dominant-baseline='central'>${ini}</text>` +
    `</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

const GRAPH_PALETTE: Record<Theme, {
  nodeBg: string; nodeText: string; border: string;
  edge: string; edgeText: string; edgeTextBg: string;
}> = {
  light: { nodeBg: "#ffffff", nodeText: "#1d2330", border: "#7a7059", edge: "#9a8f76", edgeText: "#3a3422", edgeTextBg: "#efeadd" },
  dark:  { nodeBg: "#1f2530", nodeText: "#e6e8ec", border: "#6b7280", edge: "#888888", edgeText: "#cdd3dd", edgeTextBg: "#0f1115" },
};

export function buildStylesheet(theme: Theme = "dark"): StylesheetStyle[] {
  const c = GRAPH_PALETTE[theme];
  const sheet: StylesheetStyle[] = [
    {
      selector: "node",
      style: {
        width: "data(size)",
        height: "data(size)",
        "background-color": c.nodeBg,
        "background-image": "data(face)",
        "background-fit": "cover",
        "border-width": 3,
        "border-color": c.border,
        label: "data(label)",
        "font-size": 9,
        color: c.nodeText,
        "text-valign": "bottom",
        "text-halign": "center",
        "text-margin-y": 4,
        "text-wrap": "wrap",
        "text-max-width": "90px",
      } as cytoscape.Css.Node,
    },
    {
      selector: "edge",
      style: {
        width: 1.8,
        "curve-style": "bezier",
        "line-color": c.edge,
        "target-arrow-color": c.edge,
        "source-arrow-color": c.edge,
        label: "",
        "font-size": 8,
        color: c.edgeText,
        "text-background-color": c.edgeTextBg,
        "text-background-opacity": 0.85,
        "text-background-padding": "2px",
        "text-rotation": "autorotate",
      } as cytoscape.Css.Edge,
    },
    { selector: 'node[type="person"]', style: { shape: "ellipse" } as cytoscape.Css.Node },
    { selector: 'node[type="org"]', style: { shape: "round-rectangle" } as cytoscape.Css.Node },
    { selector: 'node[type="agency"]', style: { shape: "diamond" } as cytoscape.Css.Node },
    { selector: 'edge[direction="to"]', style: { "target-arrow-shape": "triangle" } as cytoscape.Css.Edge },
    {
      selector: 'edge[direction="both"]',
      style: { "target-arrow-shape": "triangle", "source-arrow-shape": "triangle" } as cytoscape.Css.Edge,
    },
    { selector: 'edge[status="ALLEGATION"]', style: { "line-style": "dashed" } as cytoscape.Css.Edge },
    { selector: "edge.show-label", style: { label: "data(label)" } as cytoscape.Css.Edge },
    { selector: ".dim", style: { opacity: 0.12 } as cytoscape.Css.Node },
    { selector: ".cat-hidden", style: { display: "none" } as cytoscape.Css.Node },
  ];

  for (const [side, color] of Object.entries(SIDE_PALETTE[theme])) {
    sheet.push({ selector: `node[side="${side}"]`, style: { "border-color": color, "border-width": 3.5 } as cytoscape.Css.Node });
  }
  for (const [cat, color] of Object.entries(CATEGORY_COLORS)) {
    sheet.push({
      selector: `edge[category="${cat}"]`,
      style: {
        "line-color": color,
        "target-arrow-color": color,
        "source-arrow-color": color,
      } as cytoscape.Css.Edge,
    });
  }
  return sheet;
}
