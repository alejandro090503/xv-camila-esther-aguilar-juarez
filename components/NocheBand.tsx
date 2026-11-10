"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Bloque nocturno con La noche estrellada de fondo (Ken Burns + parallax suave). */
export default function NocheBand({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.setProperty("--par", (Math.max(-1, Math.min(1, p)) * 40).toFixed(1));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section id={id} ref={ref} className={`noche ${className}`} data-top="#0f1d4a" data-bot="#0f1d4a" style={{ textAlign: "center" }}>
      <div className="noche-bg" aria-hidden="true" />
      {children}
    </section>
  );
}
