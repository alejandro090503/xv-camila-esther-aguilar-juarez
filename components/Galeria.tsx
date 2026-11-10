"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const BASE =
  "https://bsjoelxktbvlavfoozhk.supabase.co/storage/v1/object/public/fotos-clientes/xv-camila-esther-aguilar-juarez";

// 20 fotos del cliente, de bebé a hoy. `pos` = object-position revisado foto por
// foto contra el recorte real de la tarjeta 3:4 (object-fit: cover).
const POS: Record<number, string> = {
  1: "52% 50%", // horizontal: bebé en el inflable
  6: "50% 40%", // horizontal: brazos arriba en los juegos
  8: "50% 30%", // 2:3, el versículo de abajo se recorta un poco
  12: "50% 18%", // muy alta: caras arriba
  13: "47% 50%", // horizontal: con mochila, centrada
  14: "62% 50%", // horizontal: niña a la derecha del perrito
  17: "45% 50%", // horizontal: en la alberca
  20: "50% 40%", // 2:3 cuerpo completo
};
const FOTOS = Array.from({ length: 20 }, (_, i) => ({
  src: `${BASE}/foto${String(i + 1).padStart(2, "0")}.jpg`,
  alt: `Camila Esther — recuerdo ${i + 1}`,
  pos: POS[i + 1] ?? "50% 50%",
}));

const N = FOTOS.length;
const STEP = 360 / N; // 18°
const CARD_W = 210; // en 375px la tarjeta frontal mide 210px
const GAP = 14;
const RADIUS = Math.round((CARD_W + GAP) / 2 / Math.tan(Math.PI / N)); // ≈707px
const AUTO_DEG_PER_SEC = 6; // una vuelta por minuto
const DRAG_DEG_PER_PX = 0.1; // ~1:1 con el dedo en la tarjeta frontal

const stopAutoscroll = () => window.dispatchEvent(new Event("autoscroll:stop"));

export default function Galeria() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const openRef = useRef<number | null>(null);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const scene = sceneRef.current;
    const ring = ringRef.current;
    if (!scene || !ring) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rot = 0;
    let vel = 0; // grados por segundo (inercia)
    let resume = reduced ? 0 : 1; // 0..1 mezcla del giro automático
    let visible = false;
    let raf = 0;
    let last = 0;

    // arrastre
    let down = false;
    let dragging = false;
    let pid = -1;
    let startX = 0;
    let startY = 0;
    let startRot = 0;
    let lastX = 0;
    let lastT = 0;
    let downIdx = -1;

    const apply = () => {
      ring.style.transform = `translateZ(${-RADIUS}px) rotateY(${rot.toFixed(3)}deg)`;
    };
    apply();

    const tick = (t: number) => {
      raf = 0;
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      if (!dragging && openRef.current === null) {
        // inercia que se apaga y giro automático que vuelve solo
        vel *= Math.pow(0.04, dt); // ~96% menos por segundo
        if (Math.abs(vel) < 0.5) vel = 0;
        if (!reduced) resume = Math.min(1, resume + dt / 1.6);
        rot += (vel + AUTO_DEG_PER_SEC * resume * resume) * dt;
        apply();
      }
      if (visible) raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf && visible) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "80px 0px" }
    );
    io.observe(scene);

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      stopAutoscroll();
      down = true;
      dragging = false;
      pid = e.pointerId;
      startX = lastX = e.clientX;
      startY = e.clientY;
      lastT = e.timeStamp;
      startRot = rot;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
      downIdx = el ? Number(el.dataset.i) : -1;
    };
    const onMove = (e: PointerEvent) => {
      if (!down || e.pointerId !== pid) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - startY)) return;
        dragging = true;
        vel = 0;
        resume = 0;
        scene.classList.add("is-drag");
        try {
          scene.setPointerCapture(pid);
        } catch {}
      }
      const dtm = Math.max(e.timeStamp - lastT, 1);
      const inst = ((e.clientX - lastX) * DRAG_DEG_PER_PX * 1000) / dtm;
      vel = vel * 0.6 + inst * 0.4;
      lastX = e.clientX;
      lastT = e.timeStamp;
      rot = startRot + dx * DRAG_DEG_PER_PX;
      apply();
    };
    const onUp = (e: PointerEvent) => {
      if (!down || e.pointerId !== pid) return;
      down = false;
      if (dragging) {
        dragging = false;
        scene.classList.remove("is-drag");
        if (e.timeStamp - lastT > 90) vel = 0; // se detuvo antes de soltar
        vel = Math.max(-240, Math.min(240, vel));
        start();
      } else if (e.type === "pointerup" && downIdx >= 0) {
        stopAutoscroll();
        setOpen(downIdx);
      }
    };

    scene.addEventListener("pointerdown", onDown);
    scene.addEventListener("pointermove", onMove);
    scene.addEventListener("pointerup", onUp);
    scene.addEventListener("pointercancel", onUp);

    return () => {
      stop();
      io.disconnect();
      scene.removeEventListener("pointerdown", onDown);
      scene.removeEventListener("pointermove", onMove);
      scene.removeEventListener("pointerup", onUp);
      scene.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + N) % N)), []);

  // teclado + bloqueo de scroll del lightbox
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [open, close, go]);

  // swipe dentro del lightbox
  const swipe = useRef<{ x: number; y: number } | null>(null);

  return (
    <section id="galeria" className="sec" style={{ textAlign: "center", paddingLeft: 0, paddingRight: 0 }}>
      <div style={{ padding: "0 32px" }}>
        <span className="eyebrow">Recuerdos</span>
        <h2 className="heading-sm">Mi Historia</h2>

        <div className="orn" style={{ maxWidth: 180, margin: "12px auto 24px" }}>
          <span className="orn-line" />
          <span className="orn-diamond" />
          <span className="orn-line" />
        </div>
      </div>

      <div className="g3d-scene" ref={sceneRef} role="group" aria-label="Galería de fotos, desliza para girar">
        <div className="g3d-ring" ref={ringRef}>
          {FOTOS.map((f, i) => (
            <div
              className="g3d-item"
              key={f.src}
              style={{ transform: `rotateY(${i * STEP}deg) translateZ(${RADIUS}px)` }}
            >
              <button type="button" className="g3d-card" data-i={i} aria-label={`Ver foto ${i + 1}`}
                onClick={(e) => {
                  // solo teclado (Enter/Espacio); el toque lo maneja pointerup
                  if (e.detail === 0) {
                    stopAutoscroll();
                    setOpen(i);
                  }
                }}
              >
                <img
                  src={f.src}
                  alt={f.alt}
                  width={CARD_W}
                  height={280}
                  decoding="async"
                  draggable={false}
                  style={{ objectPosition: f.pos }}
                />
              </button>
              <div className="g3d-refl" aria-hidden="true">
                <div className="g3d-refl-in">
                  <img src={f.src} alt="" decoding="async" draggable={false} style={{ objectPosition: f.pos }} />
                </div>
                <span className="g3d-veil" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="g3d-hint">Desliza para girar · toca para ampliar</p>

      {open !== null &&
        createPortal(
          <div
            className="g3d-lb"
            role="dialog"
            aria-modal="true"
            aria-label={`Foto ${open + 1} de ${N}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
            onTouchStart={(e) => {
              swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
              const s = swipe.current;
              swipe.current = null;
              if (!s) return;
              const dx = e.changedTouches[0].clientX - s.x;
              const dy = e.changedTouches[0].clientY - s.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
            }}
          >
            <img
              key={open}
              className="g3d-lb-img"
              src={FOTOS[open].src}
              alt={FOTOS[open].alt}
              decoding="async"
              onClick={(e) => e.stopPropagation()}
            />
            <button type="button" className="g3d-lb-x" aria-label="Cerrar" onClick={close}>
              ×
            </button>
            <button type="button" className="g3d-lb-nav g3d-lb-prev" aria-label="Foto anterior" onClick={() => go(-1)}>
              ‹
            </button>
            <button type="button" className="g3d-lb-nav g3d-lb-next" aria-label="Foto siguiente" onClick={() => go(1)}>
              ›
            </button>
            <span className="g3d-lb-count">
              {open + 1} / {N}
            </span>
          </div>,
          document.body
        )}
    </section>
  );
}
