"use client";
import { useState } from "react";

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("C. Escobillera 20, CEDA, Iztapalapa, 09040 Ciudad de México, CDMX");

const PinIcon = () => (
  <svg className="loc-icon pin-late" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg className="loc-icon" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function Ubicacion() {
  const [tocada, setTocada] = useState(false);
  return (
    <section id="ubicacion" className="sec" style={{ textAlign: "center" }}>
      <span className="eyebrow">D&oacute;nde</span>
      <h2 className="heading-sm">Ubicaci&oacute;n</h2>

      <div className="orn" style={{ maxWidth: 180, margin: "12px auto 28px" }}>
        <span className="orn-line" />
        <span className="orn-diamond" />
        <span className="orn-line" />
      </div>

      <div
        className={`card levita${tocada ? " tocada" : ""}`}
        onTouchStart={() => setTocada(true)}
        onTouchEnd={() => setTimeout(() => setTocada(false), 600)}
      >
        <span className="loc-venue-lbl">Misa de XV a&ntilde;os y Recepci&oacute;n</span>
        <span className="loc-venue">Central de Abasto, Iztapalapa</span>

        <div className="loc-row">
          <ClockIcon />
          <span className="loc-txt">
            <strong>Recepci&oacute;n &mdash; <span className="num">5:00</span> p.m.</strong>
          </span>
        </div>
        <div className="loc-row">
          <ClockIcon />
          <span className="loc-txt">
            <strong>Misa &mdash; <span className="num">5:30</span> p.m.</strong>
          </span>
        </div>

        <div className="loc-row" style={{ alignItems: "flex-start" }}>
          <PinIcon />
          <span className="loc-txt" style={{ fontSize: 18 }}>
            C. Escobillera 20, CEDA, Iztapalapa, 09040 Ciudad de M&eacute;xico, CDMX
          </span>
        </div>

        <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="btn-map">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
          C&oacute;mo llegar
        </a>
      </div>
    </section>
  );
}
