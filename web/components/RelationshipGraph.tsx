"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { GraphData, GraphNode } from "@/lib/content";
import { CATEGORY_COLORS, CATEGORY_LABELS, SIDE_COLORS, initialsDataUri } from "@/lib/graph-style";

const GraphCanvas = dynamic(() => import("./GraphCanvas"), {
  ssr: false,
  loading: () => <div className="graph-canvas graph-loading">Loading graph…</div>,
});

const SIDE_LABEL: Record<string, string> = {
  plaintiff: "Plaintiff",
  defendant: "Defendant",
  official: "Official",
  neutral: "Neutral",
};

export default function RelationshipGraph({ data }: { data: GraphData }) {
  const [hidden, setHidden] = useState<string[]>([]);
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GraphNode | null>(null);

  const categories = useMemo(
    () => Object.keys(CATEGORY_COLORS).filter((c) => data.edges.some((e) => e.category === c)),
    [data.edges]
  );

  const toggleCat = (c: string) =>
    setHidden((h) => (h.includes(c) ? h.filter((x) => x !== c) : [...h, c]));

  return (
    <div className="graph-card">
      <div className="graph-toolbar">
        <input
          className="search"
          placeholder="Search people, orgs, agencies…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${hidden.includes(c) ? "off" : ""}`}
              onClick={() => toggleCat(c)}
              aria-pressed={!hidden.includes(c)}
            >
              <span className="dot" style={{ background: CATEGORY_COLORS[c] }} />
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`chip label-toggle ${showAllLabels ? "active" : ""}`}
          onClick={() => setShowAllLabels((v) => !v)}
          aria-pressed={showAllLabels}
        >
          Show all labels
        </button>
      </div>

      <div className="graph-stage">
        <GraphCanvas
          data={data}
          hiddenCategories={hidden}
          showAllLabels={showAllLabels}
          query={query}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />

        {selected && (
          <aside className="detail-card">
            <button className="detail-x" onClick={() => setSelected(null)} aria-label="Close">
              ✕
            </button>
            <div
              className="detail-avatar"
              style={{
                backgroundImage: `url("${selected.icon || initialsDataUri(selected.ini, selected.label)}")`,
              }}
            />
            <h3>{selected.label}</h3>
            <span className="detail-side" style={{ background: SIDE_COLORS[selected.side] }}>
              {SIDE_LABEL[selected.side]}
            </span>
            {selected.role && <p className="detail-role">{selected.role}</p>}
            {selected.statement && <p className="detail-stmt">{selected.statement}</p>}
            <a className="detail-jump" href="#roster">
              ↓ View in roster
            </a>
          </aside>
        )}
      </div>

      <div className="graph-legend">
        <div className="legend-row">
          <span className="lg-shape">● person</span>
          <span className="lg-shape">▢ org</span>
          <span className="lg-shape">◇ agency</span>
          <span style={{ color: SIDE_COLORS.plaintiff }}>● plaintiff</span>
          <span style={{ color: SIDE_COLORS.defendant }}>● defendant</span>
          <span style={{ color: SIDE_COLORS.official }}>● official/neutral</span>
        </div>
        <p className="graph-prov">
          Imagery linked from public sources; private individuals shown as initials only. See{" "}
          <Link href="/disclaimer">DISCLAIMER</Link>.
        </p>
      </div>

      <noscript>
        <p className="graph-prov">
          The interactive relationship graph requires JavaScript. The full roster is in the table below.
        </p>
      </noscript>
    </div>
  );
}
