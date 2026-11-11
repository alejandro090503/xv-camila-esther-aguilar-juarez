"use client";
// Mesa de regalos + Lluvia de sobres (diseño de boda-jeffersson-y-vanessa,
// repintado a la paleta de Camila). Estilos en app/fx-dress-sobres.css (prefijo fx-).
// La caja de regalo que se abre (diseño de boda-paola-e-ivan) usa app/fx-regalo.css (prefijo rg-).
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

/* ── Caja de regalo (diseño boda-paola-e-ivan) ───────────────
   Al tocarla, la tapa sale volando, estalla confeti y se abre un
   modal con un carrusel (scroll-snap nativo) con las opciones. */
const CONFETTI = ["#D4AF37", "#f3dc9a", "#8a6a1f", "#4A7BB7", "#1E3A8A", "#F7E7CE", "#7fa3d6"];
const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function burstConfetti(canvas: HTMLCanvasElement | null) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const stage = canvas.parentElement;
  if (!ctx || !stage) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = stage.offsetWidth, H = stage.offsetHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const n = window.innerWidth < 520 ? 70 : 120;
  const cx = W / 2, cy = H / 2;
  const parts = Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n + (i % 7) * 0.11;
    const sp = 3.4 + (i % 11) * 0.62;
    return {
      x: cx, y: cy,
      vx: Math.cos(a) * sp * (0.6 + (i % 5) * 0.14),
      vy: Math.sin(a) * sp * (0.6 + (i % 3) * 0.2) - 3.6,
      w: 5 + (i % 4) * 2.4, h: 3 + (i % 3) * 2,
      rot: (i % 360) * 0.0175, vr: (i % 2 ? 1 : -1) * (0.06 + (i % 5) * 0.02),
      c: CONFETTI[i % CONFETTI.length],
    };
  });
  let t0: number | null = null;
  const frame = (ts: number) => {
    if (t0 === null) t0 = ts;
    const life = Math.max(0, 1 - (ts - t0) / 1000 / 2.6);
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of parts) {
      p.vy += 0.14; p.vx *= 0.992;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (life > 0 && p.y < H + 40) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }
    if (alive) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, W, H);
  };
  requestAnimationFrame(frame);
}

const IcoClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const IcoPrev = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const IcoNext = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const TOTAL_SLIDES = 2;

function GiftBox({ copiado, onCopiar }: { copiado: boolean; onCopiar: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [boxOpen, setBoxOpen] = useState(false); // la tapa salió volando
  const [modal, setModal] = useState(false); // modal visible
  const [idx, setIdx] = useState(0);

  const boxRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const confRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);
  const viaTeclado = useRef(false);
  const savedY = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setMounted(true);
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  /* Carrusel */
  const goTo = useCallback((n: number, behavior: ScrollBehavior = "smooth") => {
    const i = Math.max(0, Math.min(TOTAL_SLIDES - 1, n));
    idxRef.current = i;
    setIdx(i);
    const v = viewRef.current;
    if (!v) return;
    const target = i * v.clientWidth;
    const b: ScrollBehavior = prefersReduced() ? "auto" : behavior;
    try { v.scrollTo({ left: target, behavior: b }); } catch { v.scrollLeft = target; }
    // Red de seguridad si el scroll suave no se aplica
    window.setTimeout(() => { if (Math.abs(v.scrollLeft - target) > 4) v.scrollLeft = target; }, 420);
  }, []);

  useEffect(() => {
    const v = viewRef.current;
    if (!v || !mounted) return;
    let tick = 0;
    const sync = () => {
      const n = Math.max(0, Math.min(TOTAL_SLIDES - 1, Math.round(v.scrollLeft / Math.max(1, v.clientWidth))));
      if (n !== idxRef.current) { idxRef.current = n; setIdx(n); }
    };
    const onScroll = () => { window.clearTimeout(tick); tick = window.setTimeout(sync, 90); };
    const onTouchEnd = () => { window.setTimeout(sync, 160); window.setTimeout(sync, 520); };
    // Arrastre con ratón (en escritorio no hay gesto táctil)
    let down = false, sx = 0, ss = 0, moved = 0;
    const md = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a,button")) return;
      down = true; moved = 0; sx = e.clientX; ss = v.scrollLeft;
      v.classList.add("is-dragging");
    };
    const mm = (e: MouseEvent) => {
      if (!down) return;
      const d = e.clientX - sx;
      moved = Math.abs(d);
      if (moved > 3) e.preventDefault();
      v.scrollLeft = ss - d;
    };
    const mu = () => {
      if (!down) return;
      down = false;
      v.classList.remove("is-dragging");
      goTo(Math.round(v.scrollLeft / Math.max(1, v.clientWidth)));
    };
    const clickCap = (e: MouseEvent) => {
      if (moved > 8) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    };
    const onResize = () => goTo(idxRef.current, "auto");

    v.addEventListener("scroll", onScroll, { passive: true });
    v.addEventListener("scrollend", sync);
    v.addEventListener("touchend", onTouchEnd, { passive: true });
    v.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    v.addEventListener("click", clickCap, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(tick);
      v.removeEventListener("scroll", onScroll);
      v.removeEventListener("scrollend", sync);
      v.removeEventListener("touchend", onTouchEnd);
      v.removeEventListener("mousedown", md);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
      v.removeEventListener("click", clickCap, true);
      window.removeEventListener("resize", onResize);
    };
  }, [mounted, goTo]);

  /* Bloqueo de scroll compatible con iOS (overflow:hidden en body no basta en Safari) */
  const lock = () => {
    const b = document.body;
    savedY.current = window.pageYOffset || document.documentElement.scrollTop || 0;
    b.style.position = "fixed";
    b.style.top = `${-savedY.current}px`;
    b.style.left = "0";
    b.style.right = "0";
    b.style.width = "100%";
    b.classList.add("rg-locked");
  };
  const unlock = useCallback(() => {
    const b = document.body;
    if (!b.classList.contains("rg-locked")) return;
    b.classList.remove("rg-locked");
    b.style.position = "";
    b.style.top = "";
    b.style.left = "";
    b.style.right = "";
    b.style.width = "";
    window.scrollTo(0, savedY.current);
  }, []);

  const openGift = () => {
    window.dispatchEvent(new Event("autoscroll:stop"));
    if (modal) return;
    const reduced = prefersReduced();
    setBoxOpen(true);
    if (!reduced) burstConfetti(confRef.current);
    const show = () => {
      setModal(true);
      lock();
      requestAnimationFrame(() => {
        goTo(0, "auto");
        if (viaTeclado.current) closeRef.current?.focus();
      });
    };
    if (reduced) show();
    else later(show, 240);
  };

  const closeGift = useCallback(() => {
    setModal(false);
    unlock();
    // La caja vuelve a cerrarse para poder abrirla otra vez
    timers.current.push(
      window.setTimeout(() => { setBoxOpen(false); goTo(0, "auto"); }, prefersReduced() ? 0 : 420)
    );
    if (viaTeclado.current) boxRef.current?.focus();
    viaTeclado.current = false;
  }, [goTo, unlock]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeGift(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal, closeGift]);

  // Si se desmonta con el modal abierto, libera el body
  useEffect(() => () => unlock(), [unlock]);

  const tab = modal ? 0 : -1;
  const slideProps = (n: number) => ({
    className: "rg-slide",
    "aria-hidden": idx !== n,
    inert: idx !== n || !modal ? true : undefined,
  });

  const dialog = (
    <div
      className={`rg-backdrop${modal ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mesa de regalos"
      aria-hidden={!modal}
      onClick={(e) => { if (e.target === e.currentTarget) closeGift(); }}
    >
      <div className="rg-reveal" id="rg-reveal">
        <button ref={closeRef} type="button" className="rg-close" aria-label="Cerrar" onClick={closeGift} tabIndex={tab}>
          <IcoClose />
        </button>
        <div className="rg-eyebrow">Elige una opción</div>

        <div
          ref={viewRef}
          className="rg-viewport"
          role="group"
          aria-label="Opciones de mesa de regalos"
          tabIndex={tab}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") { e.preventDefault(); goTo(idxRef.current - 1); }
            if (e.key === "ArrowRight") { e.preventDefault(); goTo(idxRef.current + 1); }
          }}
        >
          <div className="rg-track">
            <div {...slideProps(0)}>
              <div className="rg-logo">
                <img src="/regalos/amazon.svg" alt="Amazon" width={603} height={182} decoding="async" draggable={false} />
              </div>
              <div className="rg-title">Mesa de regalos</div>
              <p className="rg-desc">Consulta mi lista de regalos.</p>
              <a className="rg-btn" href={AMAZON} target="_blank" rel="noopener noreferrer">
                Ver lista
              </a>
            </div>

            <div {...slideProps(1)}>
              <div className="rg-logo">
                <img src="/regalos/bbva.svg" alt="BBVA" width={600} height={180} decoding="async" draggable={false} />
              </div>
              <div className="rg-title">Transferencia</div>
              <p className="rg-desc">BBVA &middot; Cuenta CLABE</p>
              <span className="rg-clabe">{CLABE}</span>
              <button
                type="button"
                className={`rg-btn${copiado ? " is-copied" : ""}`}
                onClick={onCopiar}
                aria-live="polite"
              >
                {copiado ? "Copiada" : "Copiar CLABE"}
              </button>
            </div>
          </div>
        </div>

        <div className="rg-nav">
          <button
            type="button" className="rg-arrow" aria-label="Opción anterior"
            disabled={idx === 0} onClick={() => goTo(idx - 1)} tabIndex={tab}
          >
            <IcoPrev />
          </button>
          <div className="rg-dots">
            {Array.from({ length: TOTAL_SLIDES }, (_, n) => (
              <button
                key={n}
                type="button"
                className={`rg-dot${idx === n ? " is-active" : ""}`}
                aria-label={`Opción ${n + 1} de ${TOTAL_SLIDES}`}
                aria-current={idx === n}
                onClick={() => goTo(n)}
                tabIndex={tab}
              />
            ))}
          </div>
          <button
            type="button" className="rg-arrow" aria-label="Siguiente opción"
            disabled={idx === TOTAL_SLIDES - 1} onClick={() => goTo(idx + 1)} tabIndex={tab}
          >
            <IcoNext />
          </button>
        </div>
        <div className="rg-hint">Desliza para ver la otra opción</div>
      </div>
    </div>
  );

  return (
    <div className="rg-stage">
      <canvas ref={confRef} className="rg-confetti" aria-hidden="true" />
      <div className="rg-box-wrap">
        <button
          ref={boxRef}
          type="button"
          className={`rg-box${boxOpen ? " is-open" : ""}`}
          aria-label="Abrir la mesa de regalos"
          aria-expanded={modal}
          aria-controls="rg-reveal"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") viaTeclado.current = true; }}
          onPointerDown={() => { viaTeclado.current = false; }}
          onClick={openGift}
        >
          <svg viewBox="0 0 200 190" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="rgShade" x1="26" y1="72" x2="174" y2="176" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" stopOpacity=".16" />
                <stop offset="1" stopColor="#000000" stopOpacity=".24" />
              </linearGradient>
              <linearGradient id="rgGoldV" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#b8922a" />
                <stop offset=".45" stopColor="#f3dc9a" />
                <stop offset=".6" stopColor="#D4AF37" />
                <stop offset="1" stopColor="#8a6a1f" />
              </linearGradient>
              <linearGradient id="rgGoldH" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f3dc9a" />
                <stop offset=".5" stopColor="#D4AF37" />
                <stop offset="1" stopColor="#8a6a1f" />
              </linearGradient>
              <linearGradient id="rgBow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f3dc9a" />
                <stop offset=".55" stopColor="#D4AF37" />
                <stop offset="1" stopColor="#9a7726" />
              </linearGradient>
            </defs>
            {/* cuerpo zafiro */}
            <rect x="26" y="72" width="148" height="104" rx="4" fill="#1E3A8A" />
            <rect x="26" y="72" width="148" height="104" rx="4" fill="url(#rgShade)" />
            {/* estrellitas y remolinos tipo Noche Estrellada */}
            <g fill="#f3dc9a">
              <path d="M50 92 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" opacity=".9" />
              <path d="M150 140 l1.3 3.2 3.2 1.3 -3.2 1.3 -1.3 3.2 -1.3 -3.2 -3.2 -1.3 3.2 -1.3z" opacity=".8" />
              <circle cx="62" cy="150" r="1.6" opacity=".7" />
              <circle cx="140" cy="94" r="1.4" opacity=".7" />
              <circle cx="156" cy="160" r="1.1" opacity=".6" />
              <circle cx="44" cy="134" r="1.1" opacity=".6" />
            </g>
            <path d="M36 158 C52 146 66 160 80 150" stroke="#4A7BB7" strokeWidth="1.3" strokeLinecap="round" opacity=".55" />
            <path d="M122 104 C134 96 146 108 160 100" stroke="#4A7BB7" strokeWidth="1.3" strokeLinecap="round" opacity=".55" />
            {/* listón dorado */}
            <rect x="88" y="72" width="24" height="104" fill="url(#rgGoldV)" />
            <rect x="26" y="112" width="148" height="15" fill="url(#rgGoldH)" />
            <rect x="26.7" y="72.7" width="146.6" height="102.6" rx="3.3" stroke="#8a6a1f" strokeWidth="1.4" />
            {/* tapa con moño */}
            <g className="rg-lid">
              <rect x="16" y="54" width="168" height="26" rx="4" fill="#2a4ea3" />
              <rect x="16" y="54" width="168" height="26" rx="4" fill="url(#rgShade)" />
              <rect x="16.7" y="54.7" width="166.6" height="24.6" rx="3.3" stroke="#8a6a1f" strokeWidth="1.4" />
              <rect x="88" y="54" width="24" height="26" fill="url(#rgGoldV)" />
              <path d="M100 54 C100 40 84 26 70 32 C58 37 62 52 78 54 Z" fill="url(#rgBow)" stroke="#8a6a1f" strokeWidth="1.2" />
              <path d="M100 54 C100 40 116 26 130 32 C142 37 138 52 122 54 Z" fill="url(#rgBow)" stroke="#8a6a1f" strokeWidth="1.2" />
              <path d="M84 40 C88 44 94 49 99 52" stroke="#8a6a1f" strokeWidth=".9" opacity=".55" />
              <path d="M116 40 C112 44 106 49 101 52" stroke="#8a6a1f" strokeWidth=".9" opacity=".55" />
              <circle cx="100" cy="52" r="8" fill="#f3dc9a" stroke="#8a6a1f" strokeWidth="1.2" />
            </g>
          </svg>
        </button>
        <span className={`rg-cta${boxOpen ? " is-hidden" : ""}`} aria-hidden="true">
          Toca el regalo
        </span>
      </div>
      {mounted ? createPortal(dialog, document.body) : null}
    </div>
  );
}

export default function MesaRegalos() {
  const [copiado, setCopiado] = useState(false);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [open, setOpen] = useState(false);

  const secRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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

        {/* Caja de regalo que se abre y muestra las opciones */}
        <GiftBox copiado={copiado} onCopiar={copiar} />

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
