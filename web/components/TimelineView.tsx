"use client";

import { useMemo, useState } from "react";
import { InlineMarkdown } from "./Markdown";
import type { Timeline, Row } from "@/lib/content";
import { BrickCard, type BrickVariant } from "@/components/brick/BrickCard";

type Labels = Record<string, string>;
const tt = (labels: Labels, key: string) => labels[key] ?? key;

const FILTER_KEYS = ["all", "confirmed", "allegation", "reported"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const filterLabel = (labels: Labels, key: FilterKey) =>
  key === "all" ? tt(labels, "timeline.filterAll") : tt(labels, `status.${key}`);

export default function TimelineView({ data, labels, locale }: { data: Timeline; labels: Labels; locale?: string }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [q, setQ] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data.rows.length };
    for (const r of data.rows) c[r.status!] = (c[r.status!] || 0) + 1;
    return c;
  }, [data.rows]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = data.rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (needle && !r.plain.toLowerCase().includes(needle)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    const ZERO = { y: 0, m: 0, d: 0 };
    return filtered.slice().sort((a, b) => {
      const sa = a.sort ?? ZERO;
      const sb = b.sort ?? ZERO;
      const byDate = sa.y - sb.y || sa.m - sb.m || sa.d - sb.d;
      if (byDate !== 0) return dir * byDate;
      // Tie on date → preserve curated source order (reversed when descending).
      return dir * ((a.order ?? 0) - (b.order ?? 0));
    });
  }, [data.rows, filter, q, sortDir]);

  // Indices come from the canonical (English) data, computed at derive time, so they
  // stay correct after the column headers are translated.
  const idx = { date: data.dateIdx, event: data.eventIdx, source: data.sourceIdx };

  const countLabel = tt(labels, "timeline.count")
    .replace("{shown}", String(visible.length))
    .replace("{total}", String(data.rows.length));

  const chipBase = "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[13px]";
  const accent: Record<string, string> = {
    all: "border-border", confirmed: "border-confirmed", allegation: "border-allegation", reported: "border-reported",
  };
  return (
    <div>
      <div className="my-2 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTER_KEYS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`${chipBase} ${filter === f ? `${accent[f]} text-foreground bg-muted` : "border-border text-muted-foreground hover:text-foreground"}`}>
              {filterLabel(labels, f)}
              <span className="rounded-full bg-background px-1.5 text-[11px] text-muted-foreground">{counts[f] ?? 0}</span>
            </button>
          ))}
        </div>
        <input className="min-w-[200px] flex-1 rounded-lg border-2 border-border bg-card px-3 py-2 text-sm"
          placeholder={tt(labels, "timeline.search")} value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className={`${chipBase} border-border text-muted-foreground hover:text-foreground whitespace-nowrap`}
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          aria-label={tt(labels, sortDir === "asc" ? "timeline.sortAriaAsc" : "timeline.sortAriaDesc")}>
          {tt(labels, sortDir === "asc" ? "timeline.oldestFirst" : "timeline.newestFirst")}
        </button>
      </div>

      <p className="my-1 text-[13px] text-muted-foreground">{countLabel}</p>

      <ol className="mt-3.5 list-none p-0">
        {visible.map((r: Row, i) => {
          const v = (r.status ?? "reported") as BrickVariant;
          return (
            <li key={r.order ?? i} className="mb-2.5">
              <BrickCard variant={v} studs={2} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2.5">
                  <span className="font-display font-bold text-card-foreground">
                    <InlineMarkdown locale={locale}>{r.cells[idx.date] ?? ""}</InlineMarkdown>
                  </span>
                  <span className="brick-badge" style={{ background: `var(--${r.status})` }}>
                    {tt(labels, `status.${r.status}`)}
                  </span>
                </div>
                <div className="mt-1 text-card-foreground"><InlineMarkdown locale={locale}>{r.cells[idx.event] ?? ""}</InlineMarkdown></div>
                {idx.source >= 0 && r.cells[idx.source] && (
                  <div className="mt-1.5 text-[13px] text-muted-foreground"><InlineMarkdown locale={locale}>{r.cells[idx.source]}</InlineMarkdown></div>
                )}
              </BrickCard>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
