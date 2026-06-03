"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import type { Core, ElementDefinition } from "cytoscape";
import type { GraphData, GraphNode } from "@/lib/content";
import { buildStylesheet, initialsDataUri } from "@/lib/graph-style";

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
  const cyRef = useRef<Core | null>(null);
  const onSelectRef = useRef(onSelect);
  useLayoutEffect(() => { onSelectRef.current = onSelect; });
  // Persistent focus (from selection) that hover falls back to.
  const focusRef = useRef<string | null>(null);

  // Mount once: build the graph, run layout, wire events.
  useEffect(() => {
    if (!boxRef.current) return;

    const elements: ElementDefinition[] = [
      ...data.nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          side: n.side,
          face: initialsDataUri(n.ini, n.label),
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
      style: buildStylesheet(),
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
    cy.on("mouseover", "node", (evt) => applyFocus(cy, evt.target.id()));
    cy.on("mouseout", "node", () => applyFocus(cy, focusRef.current));

    return () => {
      cancelAnimationFrame(rafId);
      cy.destroy();
      cyRef.current = null;
    };
  }, [data]);

  // Persistent focus from selection.
  useEffect(() => {
    focusRef.current = selectedId;
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

  return <div ref={boxRef} className="graph-canvas" />;
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
