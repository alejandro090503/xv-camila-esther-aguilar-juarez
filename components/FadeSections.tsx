"use client";
import { useEffect } from "react";

const PAGE_BG = "#fbf4e6";

function parse(c: string): [number, number, number] | null {
  if (!c) return null;
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(",").map((x) => parseFloat(x));
    if (p.length === 4 && p[3] === 0) return null;
    return [p[0], p[1], p[2]];
  }
  const h = c.replace("#", "");
  if (h.length === 6) return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
  return null;
}

/** Degradado de 9 paradas con curva smoothstep: color medio → transparente. */
function grad(dir: "bottom" | "top", [r, g, b]: number[]) {
  const stops = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const a = 1 - t * t * (3 - 2 * t);
    return `rgba(${r},${g},${b},${a.toFixed(3)}) ${(t * 100).toFixed(1)}%`;
  });
  return `linear-gradient(to ${dir}, ${stops.join(",")})`;
}

/**
 * Fundido uniforme entre bloques: en cada frontera A→B calcula el color medio
 * entre el borde inferior de A y el superior de B; A lo pinta abajo y B arriba.
 */
export default function FadeSections({ ready }: { ready: boolean }) {
  useEffect(() => {
    if (!ready) return;
    const wrap = document.querySelector(".wrap");
    if (!wrap) return;

    const run = () => {
      const blocks = Array.from(wrap.children) as HTMLElement[];
      const info = blocks.map((blk) => {
        // Si el color vive en el hijo (banda nocturna), pintamos sobre el hijo.
        const child = blk.firstElementChild as HTMLElement | null;
        const src = blk.dataset.top ? blk : child && child.dataset.top ? child : blk;
        let top = parse(src.dataset.top || "");
        let bot = parse(src.dataset.bot || "");
        if (!top || !bot) {
          const bg = parse(getComputedStyle(blk).backgroundColor) || parse(PAGE_BG)!;
          top = top || bg;
          bot = bot || bg;
        }
        return { target: src, top, bot, h: blk.offsetHeight, hero: blk.id === "inicio" };
      });

      const lum = (c: number[]) => (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
      info.forEach((cur, i) => {
        const t = cur.target;
        t.classList.add("fxf");
        t.style.removeProperty("--ft");
        t.style.removeProperty("--fb");
        const prev = info[i - 1];
        const next = info[i + 1];
        // Frontera con mucho contraste (crema ↔ noche): solo el lado oscuro se
        // funde hacia el color claro, sin pasar por un gris medio.
        if (prev) {
          const contrast = Math.abs(lum(cur.top) - lum(prev.bot)) > 0.3;
          if (contrast && lum(cur.top) < lum(prev.bot)) {
            t.style.setProperty("--ft", grad("bottom", prev.bot));
            t.style.setProperty("--fth", `${Math.min(220, cur.h * 0.4)}px`);
          } else if (!contrast) {
            const mid = cur.top.map((v, k) => Math.round((v + prev.bot[k]) / 2));
            t.style.setProperty("--ft", grad("bottom", mid));
            t.style.setProperty("--fth", `${Math.min(170, cur.h * 0.45)}px`);
          }
        }
        if (next) {
          const contrast = Math.abs(lum(cur.bot) - lum(next.top)) > 0.3;
          if (contrast && lum(cur.bot) < lum(next.top)) {
            t.style.setProperty("--fb", grad("top", next.top));
            t.style.setProperty("--fbh", `${cur.hero ? 120 : Math.min(220, cur.h * 0.4)}px`);
          } else if (!contrast) {
            const mid = cur.bot.map((v, k) => Math.round((v + next.top[k]) / 2));
            t.style.setProperty("--fb", grad("top", mid));
            t.style.setProperty("--fbh", `${Math.min(170, cur.h * 0.45)}px`);
          }
        }
      });
    };

    run();
    const t1 = window.setTimeout(run, 1500);
    window.addEventListener("resize", run);
    return () => {
      window.clearTimeout(t1);
      window.removeEventListener("resize", run);
    };
  }, [ready]);

  return null;
}
