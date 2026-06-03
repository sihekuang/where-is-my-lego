"use client";

import { useMemo, useState } from "react";
import { InlineMarkdown } from "./Markdown";
import type { Sectioned } from "@/lib/content";

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
      <div className="controls">
        <input
          className="search"
          placeholder={searchPlaceholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <p className="result-count">
          {shown} of {total} entries
        </p>
      </div>

      {sections.length === 0 && <p className="empty">No matches.</p>}

      {sections.map((s, si) => (
        <section key={si} className="data-section">
          {s.heading && <h2 id={slug(s.heading)}>{s.heading}</h2>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {s.columns.map((c, ci) => (
                    <th key={ci}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r, ri) => (
                  <tr key={ri}>
                    {r.cells.map((cell, ci) => (
                      <td key={ci}>
                        <InlineMarkdown>{cell}</InlineMarkdown>
                      </td>
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
