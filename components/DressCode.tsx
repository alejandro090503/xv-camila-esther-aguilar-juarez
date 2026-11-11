// Código de vestimenta — diseño de boda-fabiola-y-fernando (dibujos lado a lado
// con línea divisoria + bloque de colores), repintado a la paleta de Camila.
// Estilos en app/fx-dress-sobres.css (prefijo fx-dc-).
"use client";
import { useEffect, useState, type CSSProperties } from "react";

type Color = { hex: string; name: string };

const SUGERIDOS: Color[] = [
  { hex: "#999999", name: "Gris" },
  { hex: "#11053b", name: "Azul noche" },
  { hex: "#ffffff", name: "Blanco" },
];

// Colores a evitar del cliente = reservados para la quinceañera (viste azul cielo)
const EVITAR: Color[] = [
  { hex: "#93e3fd", name: "Azul cielo" },
  { hex: "#011d57", name: "Azul marino" },
  { hex: "#fecb3e", name: "Amarillo" },
];

function esClaro(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

/** Una sola bolita por grupo: los colores se van alternando con un fundido suave. */
function Bolitas({ colores, offset }: { colores: Color[]; offset: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % colores.length), 2600);
    return () => window.clearInterval(id);
  }, [colores.length]);
  const style = {
    "--lev": `${-(offset * 1.35 + 0.6).toFixed(2)}s`,
    "--glow": `${-(offset * 0.75).toFixed(2)}s`,
    "--sweep": `${(offset * 0.8).toFixed(2)}s`,
  } as CSSProperties;
  return (
    <div className="fx-dc-one" style={style}>
      <span className="fx-dc-sw-float fx-dc-one-float">
        <span className="fx-dc-sw-glow" aria-hidden="true" />
        {colores.map((c, k) => (
          <span
            key={c.hex}
            className={`fx-dc-one-layer${esClaro(c.hex) ? " is-light" : ""}${k === i ? " on" : ""}`}
            style={{ "--c": c.hex } as CSSProperties}
            aria-hidden="true"
          >
            <span className="fx-dc-sw-dot" />
          </span>
        ))}
      </span>
      <span className="fx-dc-one-names" aria-live="off">
        {colores.map((c, k) => (
          <span key={c.hex} className={`fx-dc-sw-name fx-dc-one-name${k === i ? " on" : ""}`}>
            {c.name}
          </span>
        ))}
      </span>
      <span className="sr-only">{colores.map((c) => c.name).join(", ")}</span>
    </div>
  );
}

export default function DressCode() {
  return (
    <section id="vestimenta" className="sec fx-dc" style={{ textAlign: "center" }}>
      <span className="eyebrow">Etiqueta</span>
      <h2 className="heading-sm">C&oacute;digo de Vestimenta</h2>

      <div className="orn" style={{ maxWidth: 180, margin: "12px auto 0" }}>
        <span className="orn-line" />
        <span className="orn-diamond" />
        <span className="orn-line" />
      </div>

      <p className="fx-dc-title">Formal</p>
      <p className="fx-dc-note">
        Formal y c&oacute;modos: puedes venir con tenis para bailar toda la noche.
      </p>

      <div className="fx-dc-figures">
        <figure className="fx-dc-fig">
          <img
            className="fx-dc-img fx-dc-img-1"
            src="/dresscode/caballero.png"
            alt="Caballero con traje formal"
            width={300}
            height={610}
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            <span className="fx-dc-fig-label">Caballeros</span>
            <span className="fx-dc-fig-sub">Traje formal</span>
          </figcaption>
        </figure>
        <figure className="fx-dc-fig">
          <img
            className="fx-dc-img fx-dc-img-2"
            src="/dresscode/dama.png"
            alt="Dama con vestido formal"
            width={248}
            height={604}
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            <span className="fx-dc-fig-label">Damas</span>
            <span className="fx-dc-fig-sub">Vestido formal</span>
          </figcaption>
        </figure>
      </div>

      <div className="fx-dc-block">
        <p className="fx-dc-group">Colores sugeridos</p>
        <p className="fx-dc-group-sub">Tonos que lucen hermosos en esta noche estrellada</p>
        <Bolitas colores={SUGERIDOS} offset={0} />
      </div>

      <div className="fx-dc-block">
        <p className="fx-dc-group">Colores a evitar</p>
        <p className="fx-dc-group-sub">Reservados para la quincea&ntilde;era</p>
        <Bolitas colores={EVITAR} offset={SUGERIDOS.length} />
        <p className="fx-dc-avoid-note">
          Estos tonos est&aacute;n reservados para la quincea&ntilde;era.
          <br />
          &iexcl;Gracias por tu comprensi&oacute;n!
        </p>
      </div>
    </section>
  );
}
