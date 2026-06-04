// Maps each parties-table row to its relationship-graph node so the graph's
// "View in roster" link can jump to the exact entry. Runs server-side on /parties
// (where both datasets are available); the shared key is the node id, which avoids
// the label/name mismatches between the graph ("Josh Johnson") and the parties
// table ("Joshua (\"Josh\") Johnson"). Pure + no source mutation.

import type { GraphNode, Row, Section, Sectioned } from "@/lib/content";

const NAME_COL = /name|entity|official/i;

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [text](url) -> text
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 3); // drop initials/punctuation; keep "bam", "ben", surnames
}

// Prefix-aware overlap so Josh~Joshua, Matt~Matthew, Ben~Benjamin still match.
function score(rowToks: string[], nodeToks: string[]): number {
  let s = 0;
  for (const nt of nodeToks) {
    if (rowToks.some((rt) => rt === nt || rt.startsWith(nt) || nt.startsWith(rt))) s++;
  }
  return s;
}

export function withRosterAnchors(
  data: Sectioned,
  nodes: GraphNode[],
): { sections: Section[]; rosterIds: string[] } {
  const rows: { row: Row; toks: string[] }[] = [];
  for (const s of data.sections) {
    const ni = s.columns.findIndex((c) => NAME_COL.test(c));
    if (ni < 0) continue;
    for (const row of s.rows) rows.push({ row, toks: tokens(row.cells[ni] || "") });
  }
  const nodeToks = nodes.map((n) => ({ id: n.id, toks: tokens(n.label) }));

  // Score every row×node pair, then assign greedily by best score, 1:1.
  const pairs: { row: Row; nodeId: string; s: number }[] = [];
  for (const r of rows) {
    for (const nt of nodeToks) {
      const s = score(r.toks, nt.toks);
      if (s >= 1) pairs.push({ row: r.row, nodeId: nt.id, s });
    }
  }
  pairs.sort((a, b) => b.s - a.s);

  const anchorByRow = new Map<Row, string>();
  const usedNode = new Set<string>();
  const usedRow = new Set<Row>();
  const rosterIds: string[] = [];
  for (const p of pairs) {
    if (usedNode.has(p.nodeId) || usedRow.has(p.row)) continue;
    anchorByRow.set(p.row, `party-${p.nodeId}`);
    usedNode.add(p.nodeId);
    usedRow.add(p.row);
    rosterIds.push(p.nodeId);
  }

  const sections = data.sections.map((s) => ({
    ...s,
    rows: s.rows.map((r) => (anchorByRow.has(r) ? { ...r, anchor: anchorByRow.get(r) } : r)),
  }));
  return { sections, rosterIds };
}
