"use client";
import { useState, useEffect, useRef } from "react";

// Recepción 5:00 p.m. hora del centro de México (UTC-6, sin horario de verano)
const TARGET = new Date("2027-01-16T17:00:00-06:00").getTime();

function calc() {
  const diff = Math.max(0, TARGET - Date.now());
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

const ZERO = { d: 0, h: 0, m: 0, s: 0 };

function Unit({ v, l, glint }: { v: number; l: string; glint?: boolean }) {
  return (
    <div className={`cd2-u${glint ? " glint" : ""}`}>
      {/* key = valor: al cambiar se re-monta y hace el giro */}
      <span key={v} className="cd2-v num tick">
        {String(v).padStart(2, "0")}
      </span>
      <span className="cd2-l">{l}</span>
    </div>
  );
}

export default function CountdownTimer() {
  // Valor estático idéntico en servidor y cliente (evita mismatch de hidratación).
  const [t, setT] = useState(ZERO);
  const [g, setG] = useState(false);
  const flip = useRef(false);

  useEffect(() => {
    setT(calc());
    const id = setInterval(() => {
      setT(calc());
      flip.current = !flip.current;
      setG(flip.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sec-sm" style={{ padding: "96px 24px 100px" }}>
      <span className="eyebrow">Nos reuniremos el</span>

      <div className="fecha-big">
        <div className="col">
          <span className="lado">S&aacute;bado</span>
        </div>
        <div className="col">
          <span className="dia num">16</span>
        </div>
        <div className="col">
          <span className="lado">Enero</span>
        </div>
      </div>
      <span className="fecha-anio num">2027</span>

      <div style={{ height: 34 }} />
      <p className="cd2-foot" style={{ marginTop: 0, marginBottom: 16 }}>Te espero a las 5:00 p.m.</p>
      <span className="eyebrow" style={{ marginBottom: 0 }}>Faltan</span>

      <div className="cd2" role="timer" aria-live="off">
        <Unit v={t.d} l="Días" glint={g} />
        <Unit v={t.h} l="Horas" glint={!g} />
        <Unit v={t.m} l="Min." glint={g} />
        <Unit v={t.s} l="Seg." glint={!g} />
      </div>

    </div>
  );
}
