"use client";
import { useEffect } from "react";

/**
 * Recorrido automático sin botón: tras abrir el sobre baja sola y lento.
 * Cualquier interacción la detiene para siempre.
 */
export default function AutoScroll({ start }: { start: boolean }) {
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const url = new URL(window.location.href);
    if (url.hash || url.searchParams.has("noauto")) return;

    let stopped = false;
    let raf = 0;
    let acc = window.scrollY;
    let last = 0;
    let ease = 0; // 0→1 arranque suave
    let expected = window.scrollY;
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;

    const stop = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      html.style.scrollBehavior = prevBehavior;
      cleanup();
    };

    const slowZones = ["inicio", "galeria", "fecha"];
    const speedAt = () => {
      const mid = window.innerHeight / 2;
      for (const id of slowZones) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top < mid && r.bottom > mid) return 26;
      }
      return 38;
    };

    const step = (t: number) => {
      if (stopped) return;
      raf = requestAnimationFrame(step);
      if (document.hidden) {
        last = 0;
        return;
      }
      if (!last) {
        last = t;
        return;
      }
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      // Alguien movió la página (scroll que no viene del recorrido)
      if (Math.abs(window.scrollY - expected) > 3) return stop();
      const max = html.scrollHeight - window.innerHeight;
      const left = max - acc;
      ease = Math.min(1, ease + dt); // ~1 s de arranque
      const brake = Math.min(1, left / 40); // frenado suave al final
      acc += speedAt() * dt * ease * Math.max(0.15, brake);
      if (acc >= max - 0.5) {
        window.scrollTo(0, max);
        return stop();
      }
      window.scrollTo(0, acc);
      expected = Math.round(window.scrollY);
      acc = Math.max(acc, window.scrollY - 0.99);
    };

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", " ", "PageDown", "PageUp", "Home", "End", "Tab"].includes(e.key)) stop();
    };
    const evts: [string, EventListener][] = [
      ["wheel", stop],
      ["touchstart", stop],
      ["pointerdown", stop],
      ["keydown", onKey as EventListener],
      ["autoscroll:stop", stop],
    ];
    const cleanup = () => evts.forEach(([n, f]) => window.removeEventListener(n, f, true));

    const timer = window.setTimeout(() => {
      if (stopped || document.hidden) return;
      html.style.scrollBehavior = "auto";
      acc = window.scrollY;
      expected = acc;
      raf = requestAnimationFrame(step);
    }, 2600);
    evts.forEach(([n, f]) => window.addEventListener(n, f, { passive: true, capture: true }));

    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, [start]);

  return null;
}
