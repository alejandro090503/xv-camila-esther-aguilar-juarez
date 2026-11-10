"use client";
import { useEffect, useRef } from "react";
import HeroFrame from "./HeroFrame";

// Polvo de luz: posiciones fijas (mismas en servidor y cliente)
const DUST = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: 30 + ((i * 53) % 60),
  size: 2 + (i % 3),
  dur: 9 + (i % 5) * 2,
  delay: -((i * 1.7) % 12),
  op: 0.3 + ((i * 7) % 5) / 10,
}));

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  // Scroll (scrub): el texto sube, se desvanece y se difumina; la pintura solo sube un poco.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const h = el.offsetHeight || 1;
        const p = Math.max(0, Math.min(1, window.scrollY / h));
        el.style.setProperty("--hp", p.toFixed(3));
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
    <section id="inicio" ref={ref} className="sec hero-night" data-top="#0b1840" data-bot="#0d1b45" style={{ textAlign: "center" }}>
      {/* Pintura: el padre sube con el scroll, el hijo deriva (no comparten transform) */}
      <div className="hero-bg" aria-hidden="true">
        <i className="hero-drift" />
      </div>
      {/* Destellos de luz cálida desenfocados */}
      <div className="hero-glints" aria-hidden="true">
        <span className="g1" /><span className="g2" /><span className="g3" /><span className="g4" />
      </div>
      <div className="hero-lens" aria-hidden="true"><span /></div>
      <div className="hero-dust" aria-hidden="true">
        {DUST.map((d, i) => (
          <i
            key={i}
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: d.size,
              height: d.size,
              animationDuration: `${d.dur}s, ${3 + (i % 4)}s`,
              animationDelay: `${d.delay}s, ${d.delay / 2}s`,
              ["--o" as string]: d.op,
            }}
          />
        ))}
      </div>
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-veil" aria-hidden="true" />

      <div className="hero-txt">
        <HeroFrame>
          <span className="eyebrow">Mis XV A&ntilde;os</span>

          <h1 className="heading hero-name foil-text dark" style={{ marginBottom: 0 }}>
            Camila Esther
          </h1>
          <span
            className="italiana hero-sur"
            style={{ display: "block", textAlign: "center", letterSpacing: ".22em", marginBottom: 6 }}
          >
            Aguilar Ju&aacute;rez
          </span>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, margin: "12px 0 8px" }}>
            <span className="orn-line" style={{ maxWidth: 60 }} />
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 1 L13.6 10.4 L23 12 L13.6 13.6 L12 23 L10.4 13.6 L1 12 L10.4 10.4 Z" fill="#D4AF37" />
            </svg>
            <span className="orn-line" style={{ maxWidth: 60 }} />
          </div>

          <div className="hero-date">
            <span className="num">16</span>
            <i />
            <span className="num">01</span>
            <i />
            <span className="num">2027</span>
          </div>
          <span className="hero-city">Ciudad de M&eacute;xico</span>

          <div style={{ height: 14 }} />

          <p className="sub" style={{ margin: "0 auto", maxWidth: 300 }}>
            Bajo un cielo lleno de estrellas, con la bendici&oacute;n de Dios y el amor de
            mi familia, te invito a celebrar el inicio de una nueva etapa en mi vida.
          </p>
        </HeroFrame>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        Desliza
        <span />
      </div>
    </section>
  );
}
