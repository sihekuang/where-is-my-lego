"use client";

import { useMemo, useState } from "react";
import { InlineMarkdown } from "./Markdown";
import type { Timeline, Row } from "@/lib/content";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "allegation", label: "Allegation" },
  { key: "reported", label: "Reported" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  allegation: "Allegation",
  reported: "Reported",
};

export default function TimelineView({ data }: { data: Timeline }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data.rows.length };
    for (const r of data.rows) c[r.status!] = (c[r.status!] || 0) + 1;
    return c;
  }, [data.rows]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (needle && !r.plain.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [data.rows, filter, q]);

  const idx = {
    date: data.columns.findIndex((c) => /date/i.test(c)),
    event: data.columns.findIndex((c) => /event/i.test(c)),
    source: data.columns.findIndex((c) => /source/i.test(c)),
  };

  return (
    <div>
      <div className="controls">
        <div className="chips">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`chip ${filter === f.key ? "active" : ""} chip-${f.key}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="count">{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <input
          className="search"
          placeholder="Search events…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <p className="result-count">
        {visible.length} of {data.rows.length} events
      </p>

      <ol className="timeline">
        {visible.map((r: Row, i) => (
          <li key={i} className={`event status-${r.status}`}>
            <div className="event-head">
              <span className="event-date">
                <InlineMarkdown>{r.cells[idx.date] ?? ""}</InlineMarkdown>
              </span>
              <span className={`badge badge-${r.status}`}>
                {STATUS_LABEL[r.status!] ?? r.status}
              </span>
            </div>
            <div className="event-body">
              <InlineMarkdown>{r.cells[idx.event] ?? ""}</InlineMarkdown>
            </div>
            {idx.source >= 0 && r.cells[idx.source] && (
              <div className="event-source">
                <InlineMarkdown>{r.cells[idx.source]}</InlineMarkdown>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
