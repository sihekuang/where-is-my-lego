import type { Core } from "cytoscape";
import { CATEGORY_COLORS, SIDE_PALETTE, GLOW_PARAMS, withAlpha, type Theme } from "@/lib/graph-style";

export type GlowOpts = { theme: Theme; time: number; focusId: string | null; reduce: boolean };

let _filterOk: boolean | null = null;
function supportsFilter(ctx: CanvasRenderingContext2D): boolean {
  if (_filterOk === null) _filterOk = typeof ctx.filter === "string";
  return _filterOk;
}

/**
 * Paint node halos, edge underglow, light-mode depth shadows, and the animated
 * allegation dash-flow onto `ctx`. All geometry is read from cytoscape's RENDERED
 * coordinates, so the glow tracks pan/zoom. Skips dimmed/hidden elements so the
 * spotlight effect reads. Safe to call every animation frame (small graph).
 */
export function drawGlow(cy: Core, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, opts: GlowOpts) {
  const { theme, time, focusId, reduce } = opts;
  const gp = GLOW_PARAMS[theme];
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (w === 0 || h === 0) return;
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = "round";
  const zoom = cy.zoom();

  // edge underglow (drawn first → sits behind nodes)
  cy.edges().forEach((edge) => {
    if (edge.removed() || edge.hasClass("cat-hidden") || edge.hasClass("dim")) return;
    const s = edge.source().renderedPosition();
    const t = edge.target().renderedPosition();
    const col = CATEGORY_COLORS[edge.data("category") as keyof typeof CATEGORY_COLORS] ?? "#888888";
    ctx.save();
    if (supportsFilter(ctx)) ctx.filter = `blur(${gp.edgeGlowBlur}px)`;
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(2, 4 * zoom);
    if (edge.data("status") === "ALLEGATION") {
      const dash = 8, gap = 8;
      ctx.setLineDash([dash, gap]);
      ctx.lineDashOffset = reduce ? 0 : -(((time / 1000) * gp.dashSpeed) % (dash + gap));
      ctx.globalAlpha = Math.min(1, gp.edgeGlowAlpha + 0.25);
    } else {
      ctx.setLineDash([]);
      ctx.globalAlpha = gp.edgeGlowAlpha;
    }
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.stroke();
    ctx.restore();
  });

  // node halos (+ light-mode depth shadow, + focus pulse)
  cy.nodes().forEach((node) => {
    if (node.removed() || node.hasClass("dim")) return;
    const p = node.renderedPosition();
    const r = node.renderedWidth() / 2;
    const side = (node.data("side") as keyof (typeof SIDE_PALETTE)["dark"]) ?? "neutral";
    const col = SIDE_PALETTE[theme][side] ?? SIDE_PALETTE[theme].neutral;
    // Pulse on the focused node: `amp` grows BOTH the halo radius (r * amp below) and
    // its inner opacity (haloOpacity + amp). 0 when unfocused or reduced-motion.
    let amp = 0;
    if (!reduce && focusId && node.id() === focusId) {
      amp = gp.pulseAmp * (0.5 + 0.5 * Math.sin(time / 420));
    }
    const haloR = r + gp.haloBlur * zoom + r * amp;

    if (gp.dropShadow) {
      ctx.save();
      if (supportsFilter(ctx)) ctx.filter = `blur(${gp.dropShadow.blur}px)`;
      ctx.fillStyle = gp.dropShadow.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y + gp.dropShadow.dy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const grad = ctx.createRadialGradient(p.x, p.y, r * 0.55, p.x, p.y, haloR);
    grad.addColorStop(0, withAlpha(col, Math.min(1, gp.haloOpacity + amp)));
    grad.addColorStop(1, withAlpha(col, 0));
    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
