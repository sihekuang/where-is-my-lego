"use client";

import { useMemo, useState } from "react";
import { InlineMarkdown } from "./Markdown";
import type { Sectioned } from "@/lib/content";
import { BrickTableFrame } from "@/components/brick/BrickTableFrame";

export default function SectionedTable({
  data,
  labels,
  searchPlaceholder,
  locale,
}: {
  data: Sectioned;
  labels: Record<string, string>;
  searchPlaceholder?: string;
  locale?: string;
}) {
  const tt = (k: string) => labels[k] ?? k;
  const placeholder = searchPlaceholder ?? tt("table.search");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();

  const sections = useMemo(() => {
    if (!needle) return data.sections;
    return data.sections
      .map((s) => ({
        ...s,
        rows: s.rows.filter((r) => r.plain.toLowerCase().includes(needle)),
      }))
      .filter((s) => s.rows.length > 0);
  }, [data.sections, needle]);

  const total = data.sections.reduce((n, s) => n + s.rows.length, 0);
  const shown = sections.reduce((n, s) => n + s.rows.length, 0);

  return (
    <div>
      <div className="my-2 flex flex-wrap items-center gap-3">
        <input className="min-w-[200px] flex-1 rounded-lg border-2 border-border bg-card px-3 py-2 text-sm"
          placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
        <p className="text-[13px] text-muted-foreground">
          {tt("table.entries").replace("{shown}", String(shown)).replace("{total}", String(total))}
        </p>
      </div>

      {sections.length === 0 && <p className="text-muted-foreground">{tt("table.noMatches")}</p>}

      {sections.map((s, si) => (
        <section key={si} className="mt-6">
          {s.heading && <h2 id={slug(s.heading)} className="font-display text-lg pb-1.5 border-b-2 border-border">{s.heading}</h2>}
          <BrickTableFrame>
            <table className="brick-table">
              <thead>
                <tr>
                  {s.columns.map((c, ci) => (
                    <th key={ci} className="whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r, ri) => (
                  <tr key={ri} id={r.anchor}>
                    {r.cells.map((cell, ci) => (
                      <td key={ci}><InlineMarkdown locale={locale}>{cell}</InlineMarkdown></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </BrickTableFrame>
        </section>
      ))}
    </div>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
