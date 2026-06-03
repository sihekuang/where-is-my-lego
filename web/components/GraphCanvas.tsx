"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import { useTheme } from "next-themes";
import type { Core, ElementDefinition } from "cytoscape";
import type { GraphData, GraphNode } from "@/lib/content";
import { buildStylesheet, initialsDataUri, nodeSize } from "@/lib/graph-style";
import { drawGlow } from "@/lib/graph-glow";

cytoscape.use(fcose);

type Props = {
  data: GraphData;
  hiddenCategories: string[];
  showAllLabels: boolean;
  query: string;
  selectedId: string | null;
  onSelect: (node: GraphNode | null) => void;
};

export default function GraphCanvas({
  data,
  hiddenCategories,
  showAllLabels,
  query,
  selectedId,
  onSelect,
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);
  const cyRef = useRef<Core | null>(null);
  const onSelectRef = useRef(onSelect);
  useLayoutEffect(() => { onSelectRef.current = onSelect; });
  // Persistent focus (from selection) that hover falls back to.
  const focusRef = useRef<string | null>(null);
  const themeRef = useRef<"light" | "dark">("dark");
  const activeFocusRef = useRef<string | null>(null);
  const { resolvedTheme } = useTheme();

  // Mount once: build the graph, run layout, wire events.
  useEffect(() => {
    if (!boxRef.current) return;

    const degree = new Map<string, number>();
    for (const e of data.edges) {
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    }

    const elements: ElementDefinition[] = [
      ...data.nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          side: n.side,
          face: initialsDataUri(n.ini, n.label),
          size: nodeSize(degree.get(n.id) ?? 0),
        },
      })),
      ...data.edges.map((e, i) => ({
        data: {
          id: `e${i}`,
          source: e.source,
          target: e.target,
          label: e.label,
          category: e.category,
          direction: e.direction,
          status: e.status,
        },
      })),
    ];

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cy = cytoscape({
      container: boxRef.current,
      elements,
      style: buildStylesheet(resolvedTheme === "light" ? "light" : "dark"),
      minZoom: 0.3,
      maxZoom: 2.5,
      wheelSensitivity: 0.2,
    });
    cyRef.current = cy;

    // Run fcose AFTER the nodes have their rendered dimensions. Passing `layout` as a
    // constructor option runs it before sizing, which collapses every node onto the
    // origin; deferring one frame lets the stylesheet's node size apply first.
    const rafId = requestAnimationFrame(() => {
      cy.layout({
        name: "fcose",
        animate: !reduce,
        randomize: true,
        nodeSeparation: 90,
        fit: true,
        padding: 30,
      } as cytoscape.LayoutOptions).run();
    });

    const ctx = glowRef.current?.getContext("2d") ?? null;
    let glowRaf = 0;
    const paint = (time: number) => {
      if (glowRef.current && ctx) {
        drawGlow(cy, glowRef.current, ctx, {
          theme: themeRef.current,
          time,
          focusId: activeFocusRef.current,
          reduce,
        });
      }
    };
    if (reduce) {
      const once = () => paint(0);
      once();
      cy.on("render", once);
    } else {
      const tick = (time: number) => {
        paint(time);
        glowRaf = requestAnimationFrame(tick);
      };
      glowRaf = requestAnimationFrame(tick);
    }

    // Nodes default to their initials avatar; upgrade to the real linked icon only after a
    // CORS-safe preload succeeds (matching Cytoscape's anonymous-crossorigin canvas load).
    // If the host sends no CORS headers, the node simply keeps its initials — no broken draw.
    for (const n of data.nodes) {
      if (!n.icon) continue;
      const icon = n.icon;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => cy.$id(n.id).data("face", icon);
      img.src = icon;
    }

    const byId = new Map(data.nodes.map((n) => [n.id, n]));
    cy.on("tap", "node", (evt) => {
      const node = byId.get(evt.target.id());
      onSelectRef.current(node ?? null);
    });
    cy.on("tap", (evt) => {
      if (evt.target === cy) onSelectRef.current(null);
    });
    cy.on("mouseover", "node", (evt) => { activeFocusRef.current = evt.target.id(); applyFocus(cy, evt.target.id()); });
    cy.on("mouseout", "node", () => { activeFocusRef.current = focusRef.current; applyFocus(cy, focusRef.current); });

    return () => {
      cancelAnimationFrame(rafId);
      if (glowRaf) cancelAnimationFrame(glowRaf);
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Re-theme the graph when the light/dark theme changes.
  useEffect(() => {
    const t: "light" | "dark" = resolvedTheme === "light" ? "light" : "dark";
    themeRef.current = t;
    const cy = cyRef.current;
    if (!cy) return;
    cy.style(buildStylesheet(t));
    cy.emit("render");
  }, [resolvedTheme]);

  // Persistent focus from selection.
  useEffect(() => {
    focusRef.current = selectedId;
    activeFocusRef.current = selectedId;
    if (cyRef.current) applyFocus(cyRef.current, selectedId);
  }, [selectedId]);

  // Category filter.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.edges().removeClass("cat-hidden");
    for (const cat of hiddenCategories) cy.edges(`[category="${cat}"]`).addClass("cat-hidden");
  }, [hiddenCategories]);

  // "Show all labels" toggle.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.scratch("_showAll", showAllLabels);
    if (showAllLabels) {
      cy.edges().addClass("show-label");
    } else {
      cy.edges().removeClass("show-label");
      if (focusRef.current) cy.$id(focusRef.current).connectedEdges().addClass("show-label");
    }
  }, [showAllLabels]);

  // Search highlight.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      if (focusRef.current) applyFocus(cy, focusRef.current);
      else cy.elements().removeClass("dim");
      return;
    }
    cy.batch(() => {
      cy.elements().addClass("dim");
      cy.nodes().filter((n) => n.data("label").toLowerCase().includes(q)).removeClass("dim");
    });
  }, [query]);

  const theme: "light" | "dark" = resolvedTheme === "light" ? "light" : "dark";
  const stageBg =
    theme === "dark"
      ? {
          // stud-grid layer FIRST so it paints on top of the vignette (CSS draws the first layer frontmost)
          background:
            "radial-gradient(circle, var(--stud-grid) 1.5px, transparent 1.6px), radial-gradient(circle at 50% 42%, #1a2030 0%, #0c0f15 78%)",
          backgroundSize: "22px 22px, 100% 100%",
        }
      : {
          background:
            "radial-gradient(circle, var(--stud-grid) 1.5px, transparent 1.6px), var(--background)",
          backgroundSize: "22px 22px, 100% 100%",
        };

  return (
    <div className="relative h-[720px] w-full overflow-hidden max-[640px]:h-[520px]" style={stageBg}>
      <canvas ref={glowRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
      <div ref={boxRef} className="absolute inset-0" />
    </div>
  );
}

// Dim everything except the focused node + its neighborhood; reveal those edge labels.
function applyFocus(cy: Core, id: string | null) {
  cy.batch(() => {
    cy.elements().removeClass("dim");
    if (!cy.scratch("_showAll")) cy.edges().removeClass("show-label");
    if (!id) return;
    const node = cy.$id(id);
    if (node.empty()) return;
    const keep = node.closedNeighborhood();
    cy.elements().not(keep).addClass("dim");
    node.connectedEdges().addClass("show-label");
  });
}
