"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Video en loop de La noche estrellada (Flow). Cuando esté listo, súbelo a
 * Supabase y pon aquí su URL; mientras esté vacío se usa la pintura animada.
 */
const HERO_VIDEO = "";
const HERO_POSTER =
  "https://bsjoelxktbvlavfoozhk.supabase.co/storage/v1/object/public/fotos-clientes/xv-camila-esther-aguilar-juarez/noche-hero.jpg";

// Estrellas que titilan sobre el cielo (posiciones fijas: iguales en servidor y cliente)
const STARS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 41 + 7) % 96,
  top: 4 + ((i * 29) % 46),
  size: 6 + (i % 4) * 3,
  dur: 3.2 + (i % 5) * 0.9,
  delay: -((i * 1.3) % 6),
}));

// Polvo de luz
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
  const [videoOk, setVideoOk] = useState(Boolean(HERO_VIDEO));

  // Scroll: el texto sube, se desvanece y se difumina; el fondo solo sube un poco.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const h = el.offsetHeight || 1;
        el.style.setProperty("--hp", Math.max(0, Math.min(1, window.scrollY / h)).toFixed(3));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Entrada del texto cuando se abre el sobre (.wrap deja de estar en opacity 0)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const wrap = el.closest(".wrap") as HTMLElement | null;
    let t = 0;
    const go = () => (t = window.setTimeout(() => el.classList.add("hx-on"), 350));
    if (!wrap || wrap.style.opacity !== "0") {
      go();
      return () => clearTimeout(t);
    }
    const mo = new MutationObserver(() => {
      if (wrap.style.opacity !== "0") {
        mo.disconnect();
        go();
      }
    });
    mo.observe(wrap, { attributes: true, attributeFilter: ["style"] });
    return () => {
      mo.disconnect();
      clearTimeout(t);
    };
  }, []);

  return (
    <section id="inicio" ref={ref} className="sec hero-night hx" data-top="#0b1840" data-bot="#0d1b45">
      {/* Fondo: el padre sube con el scroll; los hijos se mueven solos */}
      <div className="hero-bg" aria-hidden="true">
        {videoOk ? (
          <video
            className="hx-video"
            src={HERO_VIDEO}
            poster={HERO_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoOk(false)}
          />
        ) : (
          <>
            <i className="hero-drift" />
            {/* Segunda capa de la pintura, más grande y en sentido contrario:
                al cruzarse se siente que el cielo gira */}
            <i className="hx-swirl" />
          </>
        )}
      </div>

      <div className="hero-glints" aria-hidden="true">
        <span className="g1" /><span className="g2" /><span className="g3" /><span className="g4" />
      </div>
      <div className="hero-lens" aria-hidden="true"><span /></div>
      <div className="hx-stars" aria-hidden="true">
        {STARS.map((s, i) => (
          <i
            key={i}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
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

      <div className="hero-txt hx-txt">
        <span className="hx-eyebrow">Mis XV A&ntilde;os</span>
        <h1 className="hx-name">
          <span>Camila</span>
          <span>Esther</span>
        </h1>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        Desliza
        <span />
      </div>
    </section>
  );
}
