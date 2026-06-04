import assert from "node:assert/strict";
import { overlayTimeline, overlaySectioned, overlayGraph } from "../lib/overlay.ts";

const canonTl = {
  columns: ["Date", "Event"], statusIdx: -1,
  rows: [
    { cells: ["Nov 22, 2023", "Consigned"], plain: "Nov 22, 2023 • Consigned", status: "confirmed", sort: { y: 2023, m: 11, d: 22 }, order: 0 },
  ],
};
const trTl = { columns: ["日期", "事件"], rows: [{ cells: ["2023年11月22日", "已寄售"], plain: "2023年11月22日 • 已寄售" }] };

const m = overlayTimeline(canonTl, trTl);
assert.equal(m.columns[0], "日期", "column overlaid");
assert.equal(m.rows[0].cells[1], "已寄售", "cell overlaid");
assert.equal(m.rows[0].plain, "2023年11月22日 • 已寄售", "plain overlaid (in-locale search)");
assert.equal(m.rows[0].status, "confirmed", "status preserved from canonical");
assert.deepEqual(m.rows[0].sort, { y: 2023, m: 11, d: 22 }, "sort preserved from canonical");

assert.equal(overlayTimeline(canonTl, null).rows[0].cells[1], "Consigned", "null translation falls back to English");
assert.equal(overlayTimeline(canonTl, { columns: ["日期", "事件"], rows: [] }).rows[0].cells[1], "Consigned", "missing row falls back");

const canonG = { nodes: [{ id: "ben", label: "Reckless Ben", type: "person", side: "defendant", ini: "RB", role: "YouTuber" }], edges: [{ source: "ben", target: "ben", label: "self", category: "corporate", direction: "none", status: "CONFIRMED" }] };
const trG = { nodes: [{ id: "ben", label: "鲁莽的本", role: "油管主播" }], edges: [{ label: "自身" }] };
const mg = overlayGraph(canonG, trG);
assert.equal(mg.nodes[0].label, "鲁莽的本", "node label overlaid");
assert.equal(mg.nodes[0].type, "person", "node type preserved");
assert.equal(mg.nodes[0].ini, "RB", "initials preserved");
assert.equal(mg.edges[0].label, "自身", "edge label overlaid");
assert.equal(mg.edges[0].category, "corporate", "edge category preserved");

const canonSec = { sections: [{ heading: "Owners", columns: ["Name", "Role"], rows: [{ cells: ["Mansell", "consignor"], plain: "Mansell • consignor" }] }] };
const trSec = { sections: [{ heading: "当事方", columns: ["姓名", "角色"], rows: [{ cells: ["曼塞尔", "寄售人"], plain: "曼塞尔 • 寄售人" }] }] };
const ms = overlaySectioned(canonSec, trSec);
assert.equal(ms.sections[0].heading, "当事方", "section heading overlaid");
assert.equal(ms.sections[0].columns[1], "角色", "section column overlaid");
assert.equal(ms.sections[0].rows[0].cells[0], "曼塞尔", "section cell overlaid");
assert.equal(overlaySectioned(canonSec, null).sections[0].heading, "Owners", "null translation falls back to English heading");

console.log("overlay: merge + fallback assertions passed");
