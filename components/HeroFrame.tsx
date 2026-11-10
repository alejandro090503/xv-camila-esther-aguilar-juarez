"use client";
import { useEffect, useRef, type ReactNode } from "react";

/* Definiciones de oro brunido, compartidas por todas las piezas ornamentales. */
function GoldDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        {/* Oro brunido para las esquinas (espacio 64x64) */}
        <linearGradient id="hfGoldC" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="58" y2="58">
          <stop offset="0%" stopColor="#6b4f1c" />
          <stop offset="18%" stopColor="#a8822f" />
          <stop offset="36%" stopColor="#f0d79a" />
          <stop offset="52%" stopColor="#c9a04e" />
          <stop offset="72%" stopColor="#8a6a28" />
          <stop offset="100%" stopColor="#6b4f1c" />
        </linearGradient>
        {/* Oro brunido para los remates (espacio 180x34) */}
        <linearGradient id="hfGoldR" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="34">
          <stop offset="0%" stopColor="#f0d79a" />
          <stop offset="26%" stopColor="#c9a04e" />
          <stop offset="58%" stopColor="#9a7830" />
          <stop offset="100%" stopColor="#6b4f1c" />
        </linearGradient>
        <radialGradient id="hfPearl" cx="34%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#fdf3d8" />
          <stop offset="42%" stopColor="#d9b465" />
          <stop offset="100%" stopColor="#7c5e2b" />
        </radialGradient>
        <filter id="hfLift" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0.8" stdDeviation="0.9" floodColor="#5a4416" floodOpacity="0.32" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Filigrana de esquina: volutas de acanto en trazo de grosor variable
 * (paths rellenos que se afinan hacia la punta) + escuadra y perlas.
 */
function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const mirror = { tl: "none", tr: "scaleX(-1)", bl: "scaleY(-1)", br: "scale(-1,-1)" }[pos];
  // Voluta que corre pegada al filete superior y remata en espiral.
  // Se dibuja una vez y se refleja sobre la diagonal para el brazo vertical.
  const VOLUTA =
    "M7 7 C20 7.4, 34 9.4, 43 14.8 C48 17.8, 52.2 15.2, 50.6 11.4 " +
    "C49.2 8.1, 44.8 8.0, 43.5 11.1 C44.8 9.5, 47.6 9.7, 48.4 11.9 " +
    "C49.4 14.7, 46.6 16.5, 43.4 14.5 C34.6 8.9, 20.6 10.3, 7.6 10.1 Z";
  const HOJA = "M17.5 10.6 C23.6 11.9, 27.8 15.4, 29 20.6 C23.8 19.4, 19.2 15.9, 17.5 10.6 Z";
  return (
    <span className={`hf-cnr hf-cnr-${pos}`} aria-hidden="true">
      <svg viewBox="0 0 58 58" fill="none" className="hf-cnr-svg" style={{ transform: mirror }}>
        <g filter="url(#hfLift)">
          {/* Escuadra exterior: sliver relleno que se afina hacia el extremo */}
          <path d="M1.4 1.4 L34 1.4 L34 2.9 L2.9 3.3 L3.3 34 L1.4 34 Z" fill="url(#hfGoldC)" opacity=".95" />

          <g className="hf-volute">
            <path d={VOLUTA} fill="url(#hfGoldC)" opacity=".88" />
            <path d={VOLUTA} fill="url(#hfGoldC)" opacity=".88" transform="matrix(0 1 1 0 0 0)" />
            <path d={HOJA} fill="url(#hfGoldC)" opacity=".42" />
            <path d={HOJA} fill="url(#hfGoldC)" opacity=".42" transform="matrix(0 1 1 0 0 0)" />
            {/* Lanceta sobre la diagonal */}
            <path
              d="M9.6 9.6 C16 13, 20.6 17.6, 24 24 C17.6 20.6, 13 16, 9.6 9.6 Z"
              fill="url(#hfGoldC)"
              opacity=".6"
            />
          </g>
        </g>
        {/* Perlas: nudos donde el filete cambia de direccion */}
        <circle className="hf-pearl p1" cx="2.4" cy="2.4" r="2.5" fill="url(#hfPearl)" />
        <circle className="hf-pearl p3" cx="34" cy="2.1" r="1.2" fill="url(#hfPearl)" />
        <circle className="hf-pearl p3" cx="2.1" cy="34" r="1.2" fill="url(#hfPearl)" />
        <circle className="hf-pearl p2 hf-volute" cx="50.6" cy="11.4" r="1.5" fill="url(#hfPearl)" />
        <circle className="hf-pearl p2 hf-volute" cx="11.4" cy="50.6" r="1.5" fill="url(#hfPearl)" />
        <circle className="hf-pearl p4 hf-volute" cx="24.4" cy="24.4" r="1.3" fill="url(#hfPearl)" />
      </svg>
    </span>
  );
}

/** Cartela superior: volutas simetricas con rombo facetado al centro. */
function Cartela() {
  return (
    <span className="hf-rem top" aria-hidden="true">
      <svg viewBox="0 0 180 34" fill="none" className="hf-rem-svg">
        <g filter="url(#hfLift)">
          {[1, -1].map((s) => (
            <g key={s} transform={s === 1 ? undefined : "translate(180,0) scale(-1,1)"}>
              {/* Voluta lateral de grosor variable */}
              <path
                d="M6 17 C 26 17, 40 14.5, 52 10 C 62 6.2, 70 7.4, 71.6 12.2
                   C 72.8 15.8, 69.6 18.6, 66.6 17.2 C 68.8 17.4, 70.2 15.6, 69.4 13.4
                   C 68.2 10, 62.2 9.2, 54.4 12.4 C 41.6 17.6, 26 18.6, 6 18.6 Z"
                fill="url(#hfGoldR)"
                opacity=".85"
              />
              <path d="M14 21.6 C 32 21.6, 46 20, 58 16.6" stroke="url(#hfGoldR)" strokeWidth=".6" opacity=".4" />
              <circle className="hf-pearl p2" cx="52" cy="10.6" r="1.3" fill="url(#hfPearl)" />
              <circle className="hf-pearl p4" cx="30" cy="17.8" r="1.1" fill="url(#hfPearl)" />
            </g>
          ))}
          {/* Rombo facetado central */}
          <g transform="rotate(45 90 17)">
            <rect x="81.5" y="8.5" width="17" height="17" fill="url(#hfGoldR)" />
            <rect x="84.2" y="11.2" width="11.6" height="11.6" fill="var(--bg)" />
            <rect x="86.6" y="13.6" width="6.8" height="6.8" fill="url(#hfGoldR)" opacity=".9" />
            <rect x="88.7" y="15.7" width="2.6" height="2.6" fill="var(--bg)" opacity=".85" />
          </g>
          <circle className="hf-pearl p1" cx="90" cy="2.6" r="1.5" fill="url(#hfPearl)" />
        </g>
      </svg>
    </span>
  );
}

/** Contraparte inferior: version simplificada de la cartela. */
function RemateInf() {
  return (
    <span className="hf-rem bot" aria-hidden="true">
      <svg viewBox="0 0 120 20" fill="none" className="hf-rem-svg">
        <g filter="url(#hfLift)">
          <path d="M8 10 C 24 10, 34 8.6, 44 6.4" stroke="url(#hfGoldR)" strokeWidth=".9" opacity=".6" strokeLinecap="round" />
          <path d="M112 10 C 96 10, 86 8.6, 76 6.4" stroke="url(#hfGoldR)" strokeWidth=".9" opacity=".6" strokeLinecap="round" />
          <g transform="rotate(45 60 10)">
            <rect x="53.5" y="3.5" width="13" height="13" fill="url(#hfGoldR)" />
            <rect x="55.8" y="5.8" width="8.4" height="8.4" fill="var(--bg)" />
            <rect x="57.9" y="7.9" width="4.2" height="4.2" fill="url(#hfGoldR)" opacity=".9" />
          </g>
          <circle className="hf-pearl p2" cx="44" cy="6.4" r="1.2" fill="url(#hfPearl)" />
          <circle className="hf-pearl p2" cx="76" cy="6.4" r="1.2" fill="url(#hfPearl)" />
        </g>
      </svg>
    </span>
  );
}

/**
 * Marco ornamental que envuelve el Hero completo.
 * Capas: filete navy exterior -> aire -> punteado dorado finisimo ->
 * filete dorado brunido con barrido de luz -> filigranas y remates.
 */
export default function HeroFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // El Hero vive bajo .wrap, que arranca en opacity:0 hasta que se abre el
    // sobre. Solo entonces se dispara la coreografia del marco.
    const wrap = el.closest(".wrap") as HTMLElement | null;
    let timer = 0;
    const start = () => {
      timer = window.setTimeout(() => el.classList.add("hf-on"), 420);
    };
    if (!wrap || wrap.style.opacity !== "0") {
      start();
      return () => window.clearTimeout(timer);
    }
    const mo = new MutationObserver(() => {
      if (wrap.style.opacity !== "0") {
        mo.disconnect();
        start();
      }
    });
    mo.observe(wrap, { attributes: true, attributeFilter: ["style", "class"] });
    return () => {
      mo.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // Parallax finisimo del halo: se mueve ~8px en todo el recorrido del Hero.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.setProperty("--hf-par", String(Math.max(-1, Math.min(1, p)) * -8));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hf" ref={ref}>
      <GoldDefs />

      {/* Capa 1 — filete navy perimetral, dibujado por tramos */}
      <span className="hf-ln t1" aria-hidden="true" />
      <span className="hf-ln t2" aria-hidden="true" />
      <span className="hf-ln lf" aria-hidden="true" />
      <span className="hf-ln rt" aria-hidden="true" />
      <span className="hf-ln b1" aria-hidden="true" />
      <span className="hf-ln b2" aria-hidden="true" />

      {/* Halo difuso detras del texto */}
      <span className="hf-glow" aria-hidden="true" />

      {/* Capa 2 — punteado dorado finisimo */}
      <span className="hf-dots" aria-hidden="true" />

      {/* Capa 3 — filete dorado brunido con barrido de luz en loop */}
      <span className="hf-gold" aria-hidden="true" />

      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />
      <Cartela />
      <RemateInf />

      <div className="hf-body">{children}</div>
    </div>
  );
}
