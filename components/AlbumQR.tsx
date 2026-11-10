"use client";
import { useEffect, useState } from "react";

const SITE = "https://xv-camila-esther-aguilar-juarez.vercel.app";
const ALBUM_URL = `${SITE}/album`;
const FECHA = "2027-01-16"; // mismo día que fecha_evento del álbum
const QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=10&color=30-58-138&data=${encodeURIComponent(ALBUM_URL)}`;

export default function AlbumQR() {
  const [bloqueado, setBloqueado] = useState(true);

  useEffect(() => {
    const [y, m, d] = FECHA.split("-").map(Number);
    setBloqueado(new Date() < new Date(y, m - 1, d, 0, 0, 0));
  }, []);

  return (
    <section id="album" className="sec" style={{ textAlign: "center" }}>
      <span className="eyebrow">Comparte tus fotos</span>
      <h2 className="heading-sm">&Aacute;lbum de Fotos</h2>

      <div className="orn" style={{ maxWidth: 180, margin: "12px auto 24px" }}>
        <span className="orn-line" />
        <span className="orn-diamond" />
        <span className="orn-line" />
      </div>

      <p className="gift-msg" style={{ marginBottom: 24 }}>
        Ay&uacute;dame a guardar cada momento: sube aqu&iacute; las fotos que tomes
        durante el evento.
      </p>

      <div className={`album-qr${bloqueado ? " bloqueado" : ""}`}>
        <img src={QR_SRC} alt="Código QR del álbum de fotos" width={220} height={220} loading="lazy" />
        <a className="gift-btn2" href="/album">Subir mis fotos</a>
      </div>
      {bloqueado && (
        <p className="album-aviso">
          El &aacute;lbum de fotos se habilita el d&iacute;a del evento. Regresa aqu&iacute; y
          sube todas tus fotos de la noche.
        </p>
      )}
    </section>
  );
}
