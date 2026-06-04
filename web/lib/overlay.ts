import type { Timeline, Sectioned, GraphData } from "@/lib/content";

type TlTrans = { columns: string[]; rows: { cells: string[]; plain: string }[] };
type SecTrans = { sections: { heading?: string; columns: string[]; rows: { cells: string[]; plain: string }[] }[] };
type GraphTrans = { nodes: { id: string; label: string; role?: string; statement?: string }[]; edges: { label: string; note?: string }[] };

export function overlayTimeline(canon: Timeline, tr: TlTrans | null): Timeline {
  if (!tr) return canon;
  return {
    ...canon,
    columns: canon.columns.map((c, i) => tr.columns?.[i] ?? c),
    rows: canon.rows.map((r, i) => {
      const t = tr.rows?.[i];
      return t ? { ...r, cells: r.cells.map((c, j) => t.cells?.[j] ?? c), plain: t.plain ?? r.plain } : r;
    }),
  };
}

export function overlaySectioned(canon: Sectioned, tr: SecTrans | null): Sectioned {
  if (!tr) return canon;
  return {
    sections: canon.sections.map((s, si) => {
      const ts = tr.sections?.[si];
      if (!ts) return s;
      return {
        ...s,
        heading: ts.heading ?? s.heading,
        columns: s.columns.map((c, i) => ts.columns?.[i] ?? c),
        rows: s.rows.map((r, ri) => {
          const t = ts.rows?.[ri];
          return t ? { ...r, cells: r.cells.map((c, j) => t.cells?.[j] ?? c), plain: t.plain ?? r.plain } : r;
        }),
      };
    }),
  };
}

export function overlayGraph(canon: GraphData, tr: GraphTrans | null): GraphData {
  if (!tr) return canon;
  const byId = new Map(tr.nodes?.map((n) => [n.id, n]));
  return {
    nodes: canon.nodes.map((n) => {
      const t = byId.get(n.id);
      return t ? { ...n, label: t.label ?? n.label, ...(t.role ? { role: t.role } : {}), ...(t.statement ? { statement: t.statement } : {}) } : n;
    }),
    edges: canon.edges.map((e, i) => {
      const t = tr.edges?.[i];
      return t ? { ...e, label: t.label ?? e.label, ...(t.note ? { note: t.note } : {}) } : e;
    }),
  };
}
