"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import type { GraphData } from "@/lib/content";
import { CATEGORY_COLORS, SIDE_PALETTE, GLOW_PARAMS, withAlpha } from "@/lib/graph-style";
import { graphMotifDataUri, degreeMap, nodeRadius } from "@/lib/graph-motif.mjs";

const PAD = 70;

export default function HeroGraph({ data }: { data: GraphData }) {
  const { resolvedTheme } = useTheme();
  const theme: "light" | "dark" = resolvedTheme === "light" ? "light" : "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // false until we confirm (on mount) that animation should run. Drives a clean
  // swap: when `live`, the static still fades out and ONLY the canvas shows (so the
  // drifting canvas never ghosts against the static image).
  const [live, setLive] = useState(false);

  // The hero is a deliberately dark cinematic banner (its stage gradient is always dark),
  // so the static still is always dark too; the canvas re-themes on top for light/dark sites.
  // Static still — SSR / no-JS / reduced-motion / small screens / first paint.
  // Built from the SAME positions as the canvas so the two can never disagree.
  const stillUri = graphMotifDataUri(data, { width: 1200, height: 480, theme: "dark", pad: PAD });

  useEffect(() => {
    const canvas = canvasRef.current, box = boxRef.current;
    if (!canvas || !box) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 640px)").matches;
    const shouldLive = !reduce && !small;
    setLive(shouldLive);
    if (!shouldLive) return; // keep the static still

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const gp = GLOW_PARAMS[theme];
    const sidePal = SIDE_PALETTE[theme];
    const degrees = degreeMap(data.edges) as Record<string, number>;
    let raf = 0;

    const draw = (time: number) => {
      const w = box.clientWidth, h = box.clientHeight;
      if (w && h) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.lineCap = "round";

        const innerW = Math.max(1, w - PAD * 2), innerH = Math.max(1, h - PAD * 2);
        const place = new Map(
          data.nodes.map((n) => {
            const p = n.pos ?? { x: 0.5, y: 0.5 };
            const seed = n.id.charCodeAt(0) + n.id.length; // gentle per-node drift
            return [n.id, {
              x: PAD + p.x * innerW + Math.sin(time / 2600 + seed) * 4,
              y: PAD + p.y * innerH + Math.cos(time / 3100 + seed) * 4,
              r: nodeRadius(degrees[n.id] || 0) * 0.62,
              side: (n.side ?? "neutral") as keyof typeof sidePal,
            }];
          })
        );

        // Edges (category-colored, allegation dashed).
        for (const e of data.edges) {
          const a = place.get(e.source), b = place.get(e.target);
          if (!a || !b) continue;
          ctx.save();
          ctx.strokeStyle = CATEGORY_COLORS[e.category] ?? "#888";
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 1.8;
          ctx.setLineDash(e.status === "ALLEGATION" ? [7, 6] : []);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          ctx.restore();
        }

        // Node halos + bodies (the two protagonists breathe via the halo pulse).
        const breathe = gp.pulseAmp * (0.5 + 0.5 * Math.sin(time / 900));
        for (const [, p] of place) {
          const col = sidePal[p.side] ?? sidePal.neutral;
          const haloR = p.r + gp.haloBlur + p.r * breathe;
          const grad = ctx.createRadialGradient(p.x, p.y, p.r * 0.55, p.x, p.y, haloR);
          grad.addColorStop(0, withAlpha(col, Math.min(1, gp.haloOpacity + breathe)));
          grad.addColorStop(1, withAlpha(col, 0));
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = theme === "dark" ? "#1f2530" : "#ffffff";
          ctx.strokeStyle = col; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
      }
      // Always reschedule: the banner is always on-screen, so this self-recovers on the
      // first frame the box has a measured size (and stays simple — no ResizeObserver).
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [data, theme]);

  return (
    <Link
      href="/parties"
      aria-label="Explore the relationship graph"
      className="group relative left-1/2 block w-screen -translate-x-1/2 overflow-hidden no-underline"
    >
      <div
        ref={boxRef}
        className="relative h-[clamp(320px,46vh,520px)] w-full"
        style={{ background: "radial-gradient(circle at 50% 44%, #1a2030 0%, #0c0f15 84%)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stillUri}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${live ? "opacity-0" : "opacity-100"}`}
        />
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        {/* Legibility scrim (left-weighted). */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,#0c0f15ee 0%,#0c0f1577 46%,transparent 78%)" }} />
        {/* Title overlay. */}
        <div className="absolute inset-0 mx-auto flex max-w-5xl flex-col justify-center px-6">
          <span className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Where Is My Lego
          </span>
          <span className="mt-2 max-w-[42ch] text-sm text-slate-300 sm:text-base">
            The Bricks &amp; Minifigs &ldquo;Reckless Ben&rdquo; dispute — every claim labeled Confirmed or Allegation.
          </span>
          <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-400/60 bg-sky-500/15 px-3 py-1 text-xs text-sky-200 transition group-hover:bg-sky-500/25">
            Explore the relationship graph →
          </span>
        </div>
      </div>
    </Link>
  );
}
