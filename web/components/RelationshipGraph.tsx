"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { GraphData, GraphNode } from "@/lib/content";
import { CATEGORY_COLORS, SIDE_COLORS, initialsDataUri } from "@/lib/graph-style";

const GraphCanvas = dynamic(() => import("./GraphCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[720px] w-full items-center justify-center text-muted-foreground max-[640px]:h-[520px]">
      Loading graph…
    </div>
  ),
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

  const chip =
    "inline-flex items-center gap-1.5 rounded-full border-2 border-border px-3 py-1 text-[13px] text-muted-foreground hover:text-foreground";

  return (
    <div
      className="relative my-2 overflow-hidden rounded-md border border-border bg-card"
      style={{ width: "min(95vw, 1320px)", marginLeft: "50%", transform: "translateX(-50%)" }}
    >
      <div className="flex flex-wrap items-center gap-2.5 border-b-2 border-border bg-muted px-3.5 py-3">
        <input
          className="min-w-[200px] flex-1 rounded-lg border-2 border-border bg-card px-3 py-2 text-sm"
          placeholder="Search people, orgs, agencies…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`${chip} ${hidden.includes(c) ? "opacity-45 line-through" : ""}`}
              onClick={() => toggleCat(c)}
              aria-pressed={!hidden.includes(c)}
            >
              <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: CATEGORY_COLORS[c] }} />
              {c}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`${chip} ml-auto ${showAllLabels ? "border-primary text-foreground" : ""}`}
          onClick={() => setShowAllLabels((v) => !v)}
          aria-pressed={showAllLabels}
        >
          Show all labels
        </button>
      </div>

      <div className="relative">
        <GraphCanvas
          data={data}
          hiddenCategories={hidden}
          showAllLabels={showAllLabels}
          query={query}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />

        {selected && (
          <aside className="absolute right-3.5 top-3.5 w-[266px] rounded-xl border border-border bg-popover p-4 shadow-xl max-[640px]:static max-[640px]:mx-3.5 max-[640px]:mb-3.5 max-[640px]:w-auto max-[640px]:shadow-none">
            <button className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground" onClick={() => setSelected(null)} aria-label="Close">
              ✕
            </button>
            <div
              className="h-16 w-16 rounded-full border-[3px] border-border bg-cover bg-center"
              style={{ backgroundImage: `url("${selected.icon || initialsDataUri(selected.ini, selected.label)}")` }}
            />
            <h3 className="mb-1.5 mt-3 text-base">{selected.label}</h3>
            <span className="inline-block rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide text-white" style={{ background: SIDE_COLORS[selected.side] }}>
              {SIDE_LABEL[selected.side]}
            </span>
            {selected.role && <p className="mt-2.5 text-[13px] text-muted-foreground">{selected.role}</p>}
            {selected.statement && <p className="mt-2.5 rounded-r border-l-[3px] border-border bg-card px-2.5 py-1 text-[12.5px] text-muted-foreground">{selected.statement}</p>}
            <a className="mt-3 inline-block text-xs text-primary hover:underline" href="#roster">
              ↓ View in roster
            </a>
          </aside>
        )}
      </div>

      <div className="border-t border-border px-3.5 py-2.5">
        <div className="flex flex-wrap gap-3.5 text-xs text-muted-foreground">
          <span>● person</span>
          <span>▢ org</span>
          <span>◇ agency</span>
          <span style={{ color: SIDE_COLORS.plaintiff }}>● plaintiff</span>
          <span style={{ color: SIDE_COLORS.defendant }}>● defendant</span>
          <span style={{ color: SIDE_COLORS.official }}>● official/neutral</span>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Imagery linked from public sources; private individuals shown as initials only. See{" "}
          <Link href="/disclaimer" className="text-primary hover:underline">DISCLAIMER</Link>.
        </p>
      </div>

      <noscript>
        <p className="px-3.5 py-2.5 text-[11px] text-muted-foreground">
          The interactive relationship graph requires JavaScript. The full roster is in the table below.
        </p>
      </noscript>
    </div>
  );
}
