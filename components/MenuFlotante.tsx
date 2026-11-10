"use client";
import { useEffect, useState } from "react";

const SECCIONES = [
  { id: "inicio", label: "Inicio" },
  { id: "galeria", label: "Mi historia" },
  { id: "familia", label: "Mis padres" },
  { id: "fecha", label: "Fecha" },
  { id: "ubicacion", label: "Ubicación" },
  { id: "itinerario", label: "Itinerario" },
  { id: "vestimenta", label: "Vestimenta" },
  { id: "regalos", label: "Regalos" },
  { id: "album", label: "Álbum" },
  { id: "rsvp", label: "Confirmar asistencia" },
];

export default function MenuFlotante({ visible }: { visible: boolean }) {
  const [activa, setActiva] = useState("inicio");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActiva(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    SECCIONES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const abrir = () => {
    window.dispatchEvent(new Event("autoscroll:stop"));
    setOpen(true);
  };

  const ir = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    document.body.style.overflow = "";
    const el = document.getElementById(id);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 320);
  };

  return (
    <>
      <div className={`mn2-btns${visible && !open ? " on" : ""}`}>
        <button type="button" className="mn2-b" onClick={abrir} aria-label="Abrir menú" aria-expanded={open}>
          <i /><i /><i />
        </button>
      </div>

      <div className={`mn2-panel${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Menú de secciones" aria-hidden={!open}>
        <button type="button" className="mn2-x" onClick={() => setOpen(false)} aria-label="Cerrar menú" tabIndex={open ? 0 : -1}>
          &times;
        </button>
        <span className="mn2-rule" />
        <ul className="mn2-list">
          {SECCIONES.map((s, i) => (
            <li key={s.id} style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}>
              <a href={`#${s.id}`} onClick={ir(s.id)} className={activa === s.id ? "act" : ""} tabIndex={open ? 0 : -1}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <span className="mn2-rule b" />
      </div>
    </>
  );
}
