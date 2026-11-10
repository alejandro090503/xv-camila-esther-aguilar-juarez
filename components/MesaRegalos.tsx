"use client";
// Mesa de regalos + Lluvia de sobres (diseño de boda-jeffersson-y-vanessa,
// repintado a la paleta de Camila). Estilos en app/fx-dress-sobres.css (prefijo fx-).
import { useCallback, useEffect, useRef, useState } from "react";

const AMAZON =
  "https://www.amazon.com.mx/registries/gl/guest-view/33RB3F3NFLJ5X?ref_=cm_sw_r_apin_ggr-subnav-share_FX0AEWC2HQ9VQPCZVDK0_1&language=en-US";
const CLABE = "012180015821893755";

type Phase = "waiting" | "landing" | "landed";

/* ── Lluvia de sobres en canvas ─────────────────────────────── */
const MAX_ALIVE = 22;
const DEPTHS = [
  { min: 14, max: 20, alpha: 0.34, speed: 34 }, // lejos
  { min: 20, max: 28, alpha: 0.55, speed: 52 }, // medio
  { min: 28, max: 38, alpha: 0.8, speed: 78 }, // cerca
];

type Drop = {
  x: number; y: number; w: number; d: number; vy: number;
  sway: number; swayF: number; ph: number; rot: number; vr: number;
};

function makeSprite(): HTMLCanvasElement {
  // Sobre de 80×56 px (se escala al dibujar): papel crema, borde y solapa dorados, mini-sello azul
  const W = 80, H = 56;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const p = g.createLinearGradient(0, H, W, 0);
  p.addColorStop(0, "#f7ecd9"); p.addColorStop(1, "#fffaf0");
  g.fillStyle = p;
  g.strokeStyle = "#c9a43a"; g.lineWidth = 2.4;
  const r = 5;
  g.beginPath();
  g.moveTo(2 + r, 2); g.lineTo(W - 2 - r, 2); g.quadraticCurveTo(W - 2, 2, W - 2, 2 + r);
  g.lineTo(W - 2, H - 2 - r); g.quadraticCurveTo(W - 2, H - 2, W - 2 - r, H - 2);
  g.lineTo(2 + r, H - 2); g.quadraticCurveTo(2, H - 2, 2, H - 2 - r);
  g.lineTo(2, 2 + r); g.quadraticCurveTo(2, 2, 2 + r, 2); g.closePath();
  g.fill(); g.stroke();
  // pliegues inferiores
  g.strokeStyle = "rgba(184,146,42,.45)"; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(3, H - 3); g.lineTo(W / 2, H * 0.52); g.lineTo(W - 3, H - 3); g.stroke();
  // solapa dorada
  const f = g.createLinearGradient(0, 0, W, H * 0.6);
  f.addColorStop(0, "#e9cf7d"); f.addColorStop(0.5, "#f3dc9a"); f.addColorStop(1, "#c9a43a");
  g.fillStyle = f; g.strokeStyle = "#8a6a1f"; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(3, 3); g.lineTo(W / 2, H * 0.6); g.lineTo(W - 3, 3); g.closePath();
  g.fill(); g.stroke();
  // mini-sello zafiro
  g.fillStyle = "#1E3A8A";
  g.beginPath(); g.arc(W / 2, H * 0.58, 7.5, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#D4AF37"; g.lineWidth = 1.4;
  g.beginPath(); g.arc(W / 2, H * 0.58, 5.4, 0, Math.PI * 2); g.stroke();
  return c;
}

function useEnvelopeRain(
  secRef: React.RefObject<HTMLElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  useEffect(() => {
    const sec = secRef.current, cv = canvasRef.current;
    if (!sec || !cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const sprite = makeSprite();
    const ratio = sprite.height / sprite.width;
    const drops: Drop[] = [];
    let W = 0, H = 0, raf = 0, last = 0, spawnT = 0, running = false, seeded = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = sec.clientWidth; H = sec.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (y?: number) => {
      const d = Math.random() < 0.4 ? 0 : Math.random() < 0.6 ? 1 : 2;
      const D = DEPTHS[d];
      const w = D.min + Math.random() * (D.max - D.min);
      drops.push({
        x: Math.random() * W, y: y ?? -w, w, d,
        vy: D.speed * (0.85 + Math.random() * 0.35),
        sway: 8 + Math.random() * 18, swayF: 0.5 + Math.random() * 0.7, ph: Math.random() * 6.28,
        rot: (Math.random() - 0.5) * 0.9, vr: (Math.random() - 0.5) * 0.8,
      });
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((t - (last || t)) / 1000, 0.05);
      last = t;
      spawnT -= dt;
      if (spawnT <= 0 && drops.length < MAX_ALIVE) { spawn(); spawnT = 0.42 + Math.random() * 0.3; }
      ctx.clearRect(0, 0, W, H);
      for (let pass = 0; pass < 3; pass++) {
        for (let i = drops.length - 1; i >= 0; i--) {
          const p = drops[i];
          if (p.d !== pass) continue;
          p.y += p.vy * dt; p.ph += p.swayF * dt; p.rot += p.vr * dt;
          if (p.y > H + p.w) { drops.splice(i, 1); continue; }
          const h = p.w * ratio;
          const fade = Math.min(1, (p.y + h) / 70) * Math.min(1, (H - p.y) / 90);
          ctx.globalAlpha = Math.max(0, DEPTHS[p.d].alpha * fade);
          ctx.save();
          ctx.translate(p.x + Math.sin(p.ph) * p.sway, p.y);
          ctx.rotate(p.rot + Math.sin(p.ph * 0.8) * 0.18);
          ctx.drawImage(sprite, -p.w / 2, -h / 2, p.w, h);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    };

    const start = () => {
      if (running) return;
      running = true; last = 0;
      if (!seeded) { seeded = true; for (let i = 0; i < 12; i++) spawn(Math.random() * H); }
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(sec);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
      rootMargin: "80px 0px",
    });
    io.observe(sec);
    const onVis = () => (document.hidden ? stop() : sec.getBoundingClientRect().bottom > 0 && start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop(); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [secRef, canvasRef]);
}

export default function MesaRegalos() {
  const [copiado, setCopiado] = useState(false);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [open, setOpen] = useState(false);
  const [cardsIn, setCardsIn] = useState(false);

  const secRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>("waiting");
  const openTimer = useRef<number | null>(null);

  useEnvelopeRain(secRef, canvasRef);

  const setP = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  const land = useCallback(() => {
    if (phaseRef.current !== "waiting") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setP("landed");
    else setP("landing");
  }, []);

  // El sobre aterriza cuando el escenario cruza el centro de la pantalla
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { land(); io.disconnect(); } },
      { rootMargin: "-42% 0px -42% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [land]);

  // Destello de las tarjetas al entrar en pantalla
  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setCardsIn(true); io.disconnect(); } },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => () => { if (openTimer.current) window.clearTimeout(openTimer.current); }, []);

  const toggle = () => {
    if (phaseRef.current === "waiting") {
      // Tocaron antes de aterrizar: aterriza y abre
      land();
      const now = phaseRef.current as Phase; // land() lo cambia
      if (openTimer.current) window.clearTimeout(openTimer.current);
      openTimer.current = window.setTimeout(() => setOpen(true), now === "landed" ? 0 : 700);
      return;
    }
    setOpen((o) => !o);
  };

  const copiar = () => {
    navigator.clipboard
      ?.writeText(CLABE)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2200);
      })
      .catch(() => {});
  };

  const btnCls = [
    "fx-env",
    phase === "landing" ? "is-landing" : "",
    phase === "landed" ? "is-landed" : "",
    open ? "open" : "",
  ].filter(Boolean).join(" ");

  return (
    <section ref={secRef} id="regalos" className="sec fx-gifts" style={{ textAlign: "center" }}>
      <div className="fx-env-rain" aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>

      <div className="fx-gifts-inner">
        <span className="eyebrow">Mesa de regalos</span>
        <h2 className="heading-sm">Obsequios</h2>

        <div className="orn" style={{ maxWidth: 180, margin: "12px auto 28px" }}>
          <span className="orn-line" />
          <span className="orn-diamond" />
          <span className="orn-line" />
        </div>

        <p className="gift-msg">
          Tu presencia es mi mejor regalo. Si deseas tener un detalle conmigo,
          aqu&iacute; te dejo algunas opciones.
        </p>

        <div ref={cardsRef} className={`gift-cards fx-gift-cards${cardsIn ? " fx-in" : ""}`}>
          <div className="gift-card fx-gift">
            <span className="fx-gift-sheen" aria-hidden="true" />
            <span className="gift-ttl">Amazon</span>
            <p className="gift-line">Consulta mi lista de regalos.</p>
            <a className="gift-btn2" href={AMAZON} target="_blank" rel="noopener noreferrer">
              Ver lista
            </a>
          </div>

          <div className="gift-card fx-gift">
            <span className="fx-gift-sheen" aria-hidden="true" />
            <span className="gift-ttl">Transferencia</span>
            <p className="gift-line">BBVA &middot; Cuenta CLABE</p>
            <span className="gift-clabe num">012180015821893755</span>
            <button type="button" className="gift-btn2" onClick={copiar}>
              {copiado ? "Copiada" : "Copiar CLABE"}
            </button>
          </div>
        </div>

        {/* Lluvia de sobres: el sobre aterriza y se abre */}
        <div ref={stageRef} className="fx-env-stage">
          <p className="fx-env-eyebrow">Lluvia de sobres</p>
          <button
            type="button"
            className={btnCls}
            aria-label={open ? "Sobre abierto, toca para cerrar" : "Sobre, toca para abrir"}
            aria-expanded={open}
            onClick={toggle}
            onAnimationEnd={(e) => {
              const t = e.target as HTMLElement;
              if (t.classList.contains("fx-env-fall") && phaseRef.current === "landing") setP("landed");
            }}
          >
            <span className="fx-env-fall">
            <span className="fx-env-body">
              <svg className="fx-env-svg" viewBox="0 0 260 200" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="fxEnvPaper" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f7ecd9" />
                    <stop offset="100%" stopColor="#fffaf0" />
                  </linearGradient>
                </defs>
                <rect x="18" y="52" width="224" height="132" rx="8" fill="url(#fxEnvPaper)" stroke="#c9a43a" strokeWidth="1.6" />
                <path d="M18 184 L130 110 L242 184" stroke="rgba(184,146,42,.45)" strokeWidth="1" fill="none" />
              </svg>
              <span className="fx-env-flap" aria-hidden="true">
                <svg viewBox="0 0 224 86" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="fxEnvFlap" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f3e3bf" />
                      <stop offset="100%" stopColor="#fffaef" />
                    </linearGradient>
                  </defs>
                  <path d="M0 0 L112 86 L224 0 Z" fill="url(#fxEnvFlap)" stroke="#c9a43a" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>
              <svg className="fx-env-seal" viewBox="0 0 60 60" aria-hidden="true">
                <circle cx="30" cy="30" r="28" fill="#1E3A8A" />
                <circle cx="30" cy="30" r="28" fill="none" stroke="#D4AF37" strokeWidth="2.2" />
                <circle cx="30" cy="30" r="21.5" fill="none" stroke="#f3dc9a" strokeWidth="1.1" opacity=".9" />
                <text
                  x="30" y="36.5" textAnchor="middle"
                  fontFamily="var(--font-cormorant), 'Cormorant Garamond', Georgia, serif"
                  fontWeight="600" fontSize="17" letterSpacing="1" fill="#f3dc9a"
                >
                  C E
                </text>
              </svg>
            </span>

            <span className="fx-env-open" aria-live="polite">
              <svg className="fx-env-mailbox" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="8" y="22" width="36" height="24" rx="5" />
                <path d="M8 30 Q26 38 44 30" />
                <rect x="18" y="8" width="16" height="16" rx="2" />
                <path d="M18 8 Q26 3 34 8" />
                <rect x="20" y="28" width="12" height="2.5" rx="1.25" fill="currentColor" stroke="none" opacity=".4" />
              </svg>
              <span className="fx-env-title">Tu presencia es mi regalo</span>
              <span className="fx-env-desc">
                El d&iacute;a del evento habr&aacute; un buz&oacute;n donde podr&aacute;s
                dejar tu sobre con mucho cari&ntilde;o.
              </span>
            </span>
            </span>
          </button>
          <button type="button" className="fx-env-hint" aria-expanded={open} onClick={toggle}>
            {open ? "Toca para cerrar" : "Toca para abrir"}
          </button>
        </div>
      </div>
    </section>
  );
}
