"use client";
import { useEffect, useRef } from "react";

/**
 * Destellos de estrellas delicados: pocas estrellas de 4 puntas que aparecen y
 * se apagan lento (oro, champán y azul acero). Nada que caiga ni que distraiga.
 */
export default function Sparkles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["212,175,55", "247,231,206", "243,220,154", "74,123,183"];
    const N = w < 600 ? 16 : 24;
    const stars = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 3 + 2.2,
      per: Math.random() * 3500 + 3500,
      off: Math.random() * 7000,
      col: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const draw = (x: number, y: number, r: number, a: number, col: string) => {
      ctx.globalAlpha = a;
      ctx.fillStyle = `rgb(${col})`;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.quadraticCurveTo(x, y, x, y + r);
      ctx.quadraticCurveTo(x, y, x - r, y);
      ctx.quadraticCurveTo(x, y, x, y - r);
      ctx.fill();
      ctx.globalAlpha = a * 0.25;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
    };

    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 33) return; // ~30 fps, ligero en iPhone
      last = t;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const ph = ((t + s.off) % s.per) / s.per; // 0..1
        const a = Math.max(0, Math.sin(ph * Math.PI)) ** 3;
        if (a < 0.02) {
          if (ph > 0.97) {
            s.x = Math.random() * w;
            s.y = Math.random() * h;
          }
          continue;
        }
        draw(s.x, s.y, s.r * (0.7 + a * 0.5), a * 0.75, s.col);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
