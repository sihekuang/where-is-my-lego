"use client";

import { useMemo, useState } from "react";
import { InlineMarkdown } from "./Markdown";
import type { Sectioned } from "@/lib/content";
import { StudRow } from "@/components/brick/StudRow";

export default function SectionedTable({
  data,
  searchPlaceholder = "Search…",
}: {
  data: Sectioned;
  searchPlaceholder?: string;
}) {
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
          placeholder={searchPlaceholder} value={q} onChange={(e) => setQ(e.target.value)} />
        <p className="text-[13px] text-muted-foreground">{shown} of {total} entries</p>
      </div>

      {sections.length === 0 && <p className="text-muted-foreground">No matches.</p>}

      {sections.map((s, si) => (
        <section key={si} className="mt-6">
          {s.heading && <h2 id={slug(s.heading)} className="font-display text-lg pb-1.5 border-b-2 border-border">{s.heading}</h2>}
          <div className="mt-2 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {s.columns.map((c, ci) => (
                    <th key={ci} className="relative whitespace-nowrap border-b-2 border-border bg-muted px-3 py-2.5 text-left font-display font-semibold text-muted-foreground">
                      {ci === 0 && <StudRow count={2} className="text-border" />}
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r, ri) => (
                  <tr key={ri} className="border-b border-border last:border-0">
                    {r.cells.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 align-top"><InlineMarkdown>{cell}</InlineMarkdown></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
