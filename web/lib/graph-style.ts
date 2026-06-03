import type cytoscape from "cytoscape";
import type { StylesheetStyle } from "cytoscape";

export const CATEGORY_COLORS: Record<string, string> = {
  legal: "#e5544b",
  transactional: "#d8862a",
  familial: "#2f9e63",
  "law-enforcement": "#22c3d6",
  corporate: "#6ea8fe",
  investigative: "#a779e6",
};

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

export function buildStylesheet(): StylesheetStyle[] {
  const sheet: StylesheetStyle[] = [
    {
      selector: "node",
      style: {
        width: 38,
        height: 38,
        "background-color": "#1f2530",
        "background-image": "data(face)",
        "background-fit": "cover",
        "border-width": 3,
        "border-color": "#6b7280",
        label: "data(label)",
        "font-size": 9,
        color: "#e6e8ec",
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
        "line-color": "#888",
        "target-arrow-color": "#888",
        "source-arrow-color": "#888",
        label: "",
        "font-size": 8,
        color: "#cdd3dd",
        "text-background-color": "#0f1115",
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

  for (const [side, color] of Object.entries(SIDE_COLORS)) {
    sheet.push({ selector: `node[side="${side}"]`, style: { "border-color": color } as cytoscape.Css.Node });
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
