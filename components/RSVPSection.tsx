"use client";
import { useState, useEffect, useRef } from "react";

const PANEL_API = "https://panel-invitados.vercel.app/api/confirmar";
const RSVP_URL = "https://xv-camila-esther-aguilar-juarez.vercel.app";
// Fecha límite: sábado 2 de enero de 2027 (fin del día). Debe coincidir con el texto visible.
const DEADLINE = new Date(2027, 0, 2, 23, 59, 59, 999);

type Estado = "confirmado" | "declino";

/** Detiene el auto-scroll de la invitación cuando el invitado interactúa. */
function pararAutoscroll() {
  window.dispatchEvent(new Event("autoscroll:stop"));
}

/** Confeti de estrellas con los colores de la invitación. */
function lanzarConfeti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas");
  c.className = "confeti";
  document.body.appendChild(c);
  const ctx = c.getContext("2d")!;
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const cols = ["#D4AF37", "#f3dc9a", "#1E3A8A", "#4A7BB7", "#F7E7CE"];
  const ps = Array.from({ length: 90 }, () => ({
    x: c.width / 2 + (Math.random() - 0.5) * 80,
    y: c.height * 0.6,
    vx: (Math.random() - 0.5) * 9,
    vy: -Math.random() * 11 - 5,
    r: Math.random() * 4 + 3,
    rot: Math.random() * 6,
    col: cols[Math.floor(Math.random() * cols.length)],
  }));
  let f = 0;
  const loop = () => {
    f++;
    ctx.clearRect(0, 0, c.width, c.height);
    ps.forEach((p) => {
      p.vy += 0.28;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += 0.1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - f / 120);
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.quadraticCurveTo(0, 0, p.r, 0);
      ctx.quadraticCurveTo(0, 0, 0, p.r);
      ctx.quadraticCurveTo(0, 0, -p.r, 0);
      ctx.quadraticCurveTo(0, 0, 0, -p.r);
      ctx.fill();
      ctx.restore();
    });
    if (f < 120) requestAnimationFrame(loop);
    else c.remove();
  };
  requestAnimationFrame(loop);
}

export default function RSVPSection() {
  const [frozen, setFrozen] = useState(false);
  const [nombrePara, setNombrePara] = useState("");
  const [pasesAsignados, setPasesAsignados] = useState(1);
  const [pasesUsar, setPasesUsar] = useState(1);
  const [menores, setMenores] = useState(0);
  const [cargado, setCargado] = useState(false);
  const [desconocido, setDesconocido] = useState(false);
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  const [nombres, setNombres] = useState<string[]>([""]);
  const [nombresMenores, setNombresMenores] = useState<string[]>([]);
  const [faltan, setFaltan] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [yaRespondio, setYaRespondio] = useState(false);
  const [gracias, setGracias] = useState<{ estado: Estado; nombres: string[] } | null>(null);
  const seccionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setFrozen(Date.now() > DEADLINE.getTime());
    const params = new URLSearchParams(window.location.search);
    const para = (params.get("para") || "").trim();
    const rawP = parseInt(params.get("pases") || "1", 10);
    const urlP = isNaN(rawP) || rawP < 1 || rawP > 20 ? 1 : rawP;
    const rawM = parseInt(params.get("menores") || "0", 10);
    const urlM = isNaN(rawM) || rawM < 0 || rawM > 20 ? 0 : rawM;
    setNombrePara(para);
    setPasesAsignados(urlP);
    setPasesUsar(urlP);
    setMenores(urlM);
    if (!para) {
      // Sin link personalizado no se puede confirmar (el panel no sabría de quién es).
      setDesconocido(true);
      setCargado(true);
      return;
    }
    fetch(`${PANEL_API}?nombre=${encodeURIComponent(para)}&url_boda=${encodeURIComponent(RSVP_URL)}`)
      .then((r) => r.json())
      .then((resp) => {
        const d = resp && resp.invitado;
        if (!d) {
          setDesconocido(true);
          setCargado(true);
          return;
        }
        let p = urlP;
        if (typeof d.pases === "number" && d.pases > 0 && d.pases <= 20) {
          p = d.pases;
          setPasesAsignados(p);
          setPasesUsar(p);
        }
        let m = urlM;
        if (typeof d.pases_menores === "number" && d.pases_menores > 0 && d.pases_menores <= 20) {
          m = d.pases_menores;
          setMenores(m);
        }
        if (d.estado === "confirmado" || d.estado === "declino") {
          const guardados: string[] = d.nombres_confirmados || [];
          if (d.estado === "confirmado" && guardados.length) {
            setPasesUsar(Math.min(p, guardados.length));
            setNombres(guardados.slice(0, p));
            if (m > 0) setNombresMenores(Array(m).fill("").map((_, i) => guardados[p + i] || ""));
          }
          setChoice(d.estado === "confirmado" ? "yes" : "no");
          setYaRespondio(true);
          setGracias({ estado: d.estado, nombres: guardados });
        }
        setCargado(true);
      })
      .catch(() => setCargado(true));
  }, []);

  // Los campos siguen al contador.
  useEffect(() => {
    setNombres((prev) => Array(pasesUsar).fill("").map((_, i) => prev[i] || ""));
    setFaltan([]);
  }, [pasesUsar]);

  // Un campo por cada menor (opcional: si un menor no asiste se deja vacío).
  useEffect(() => {
    setNombresMenores((prev) => Array(menores).fill("").map((_, i) => prev[i] || ""));
  }, [menores]);

  const bloqueado = !cargado || frozen || desconocido;

  function select(c: "yes" | "no") {
    pararAutoscroll();
    setChoice(c);
    setFeedback("");
    setFaltan([]);
    if (c === "no") {
      setNombres(Array(pasesUsar).fill(""));
      setNombresMenores(Array(menores).fill(""));
    }
  }

  async function confirmar() {
    if (bloqueado || loading) return;
    if (!choice) {
      setFeedback("Por favor elige si asistirás o no.");
      return;
    }
    let lista: string[] = [];
    if (choice === "yes") {
      const vacios = nombres.map((n, i) => (n.trim() ? -1 : i)).filter((i) => i >= 0);
      if (vacios.length) {
        setFaltan(vacios);
        const escritos = pasesUsar - vacios.length;
        setFeedback(
          escritos === 0
            ? "Escribe el nombre de cada persona que asistirá."
            : `Elegiste ${pasesUsar} pases pero escribiste ${escritos} ${escritos === 1 ? "nombre" : "nombres"}. Escribe ${vacios.length === 1 ? "el nombre que falta" : `los ${vacios.length} nombres que faltan`} o baja el contador de pases.`
        );
        return;
      }
      lista = [...nombres.map((n) => n.trim()), ...nombresMenores.map((n) => n.trim()).filter(Boolean)];
    }
    const estado: Estado = choice === "yes" ? "confirmado" : "declino";
    setLoading(true);
    setFeedback("");
    try {
      const r = await fetch(PANEL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombrePara || "Invitado",
          url_boda: RSVP_URL,
          estado,
          pases_confirmados: lista.length,
          nombres_confirmados: lista,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setYaRespondio(true);
      setGracias({ estado, nombres: lista });
      if (estado === "confirmado") lanzarConfeti();
    } catch {
      setFeedback("No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const tituloGracias = gracias?.estado === "confirmado" ? "¡Gracias por confirmar!" : "Gracias por avisarme";
  const subGracias =
    gracias?.estado === "confirmado"
      ? gracias.nombres.length <= 1
        ? `Te espero${gracias.nombres[0] ? ", " + gracias.nombres[0] : ""}.`
        : `Confirmaste ${gracias.nombres.length} lugares: ${gracias.nombres.join(", ")}.`
      : "Lamento que no puedas acompañarme. Te voy a extrañar.";

  return (
    <section id="rsvp" ref={seccionRef} className="sec rsvp-sec" style={{ textAlign: "center" }}>
      <span className="eyebrow">Confirmaci&oacute;n</span>
      <h2 className="heading-sm">Confirma tu Asistencia</h2>

      <div className="orn" style={{ maxWidth: 180, margin: "12px auto 0" }}>
        <span className="orn-line" />
        <span className="orn-diamond" />
        <span className="orn-line" />
      </div>

      <p className="rv-dl">
        Confirma antes del <strong>s&aacute;bado 2 de enero de 2027</strong>
      </p>

      {nombrePara && (
        <>
          <span className="rv-para-lbl">Esta invitaci&oacute;n es para</span>
          <p className="rv-para-nom">{nombrePara}</p>
          <p className="rv-note">
            {!cargado
              ? "Cargando tu invitación…"
              : pasesAsignados + menores === 1
                ? "Hemos reservado un lugar para ti."
                : `Hemos reservado ${pasesAsignados + menores} lugares en tu honor.`}
          </p>
          {cargado && !desconocido && (
            <div className="rv-boxes">
              <div className="rv-box">
                <span className="rv-box-lbl">{pasesAsignados === 1 ? "Pase" : "Pases"}</span>
                <span className="rv-box-num">{pasesAsignados}</span>
              </div>
              {menores > 0 && (
                <div className="rv-box">
                  <span className="rv-box-lbl">{menores === 1 ? "Menor" : "Menores"}</span>
                  <span className="rv-box-num">{menores}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {desconocido && (
        <p className="rv-aviso">
          {nombrePara
            ? "No encontramos esta invitación. Por favor usa el enlace que te enviaron."
            : "Para confirmar, abre el enlace personal que te enviaron."}
        </p>
      )}

      {gracias ? (
        <div className="rv-gracias">
          <svg className="rv-gracias-icon" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="8.5 12.5 11 15 16 9.5" />
          </svg>
          <p className="rv-gracias-title">{tituloGracias}</p>
          <p className="rv-gracias-sub">{subGracias}</p>
          <button type="button" className="rv-editar" disabled={frozen} onClick={() => { setGracias(null); setFeedback(""); }}>
            Modificar mi respuesta
          </button>
        </div>
      ) : (
        <div className="rv-bandeja">
          <p className="rv-q">&iquest;Me acompa&ntilde;ar&aacute;s?</p>
          <div className="rv-toggle" role="group" aria-label="¿Asistirás?">
            <button type="button" className={`rv-toggle-btn${choice === "yes" ? " on" : ""}`} aria-pressed={choice === "yes"} disabled={bloqueado} onClick={() => select("yes")}>
              S&iacute;, asistir&eacute;
            </button>
            <button type="button" className={`rv-toggle-btn${choice === "no" ? " on" : ""}`} aria-pressed={choice === "no"} disabled={bloqueado} onClick={() => select("no")}>
              No podr&eacute; asistir
            </button>
          </div>

          {choice === "yes" && (
            <div className="rv-fields">
              {pasesAsignados > 1 && (
                <>
                  <p className="rv-help">
                    Tienes {pasesAsignados} pases reservados. Aumenta el n&uacute;mero de pases que vayas a ocupar.
                  </p>
                  <div className="rv-ctr">
                    <button type="button" aria-label="Quitar un pase" disabled={pasesUsar <= 1} onClick={() => { pararAutoscroll(); setPasesUsar((v) => Math.max(1, v - 1)); }}>&minus;</button>
                    <span className="rv-ctr-num" aria-live="polite">{pasesUsar}</span>
                    <button type="button" aria-label="Agregar un pase" disabled={pasesUsar >= pasesAsignados} onClick={() => { pararAutoscroll(); setPasesUsar((v) => Math.min(pasesAsignados, v + 1)); }}>+</button>
                  </div>
                </>
              )}
              {nombres.map((n, i) => (
                <input
                  key={`a${i}`}
                  type="text"
                  className={`rv-input${faltan.includes(i) ? " falta" : ""}`}
                  value={n}
                  placeholder={`Nombre completo del invitado ${i + 1}`}
                  aria-label={`Nombre completo del invitado ${i + 1}`}
                  maxLength={60}
                  autoComplete="off"
                  onChange={(e) => {
                    pararAutoscroll();
                    const copy = [...nombres];
                    copy[i] = e.target.value;
                    setNombres(copy);
                    if (faltan.includes(i)) setFaltan(faltan.filter((x) => x !== i));
                  }}
                />
              ))}
              {nombresMenores.map((n, i) => (
                <input
                  key={`m${i}`}
                  type="text"
                  className="rv-input"
                  value={n}
                  placeholder={`Nombre del menor ${i + 1}`}
                  aria-label={`Nombre del menor ${i + 1}`}
                  maxLength={60}
                  autoComplete="off"
                  onChange={(e) => {
                    pararAutoscroll();
                    const copy = [...nombresMenores];
                    copy[i] = e.target.value;
                    setNombresMenores(copy);
                  }}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={confirmar}
            disabled={loading || bloqueado}
            className={`rv-btn${!bloqueado && !loading ? " respira" : ""}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z" />
            </svg>
            <span>{frozen ? "Fecha límite alcanzada" : loading ? "Enviando…" : yaRespondio ? "Actualizar respuesta" : "Enviar confirmación"}</span>
          </button>
        </div>
      )}

      {feedback && <p className="rv-feedback" role="alert">{feedback}</p>}

      {frozen && <p className="rv-aviso">La fecha l&iacute;mite para confirmar ya pas&oacute;.</p>}
    </section>
  );
}
