"use client";
import { useRef, useState } from "react";

const SUPABASE =
  "https://bsjoelxktbvlavfoozhk.supabase.co/storage/v1/object/public/fotos-clientes/xv-camila-esther-aguilar-juarez";
const SOBRE_IMG = `${SUPABASE}/sobre-v2.jpg`;
const SOBRE_VIDEO = `${SUPABASE}/sobre-apertura-v2.mp4`;

interface Props {
  onStart: () => void;
  onOpen: () => void;
}

export default function SplashScreen({ onStart, onOpen }: Props) {
  const [phase, setPhase] = useState<"idle" | "video" | "done">("idle");
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("video");
    onStart();

    const vid = videoRef.current;
    if (vid) {
      vid.play().catch(() => {
        setTimeout(() => { setPhase("done"); onOpen(); }, 600);
      });
    } else {
      setTimeout(() => { setPhase("done"); onOpen(); }, 600);
    }
  };

  const handleVideoEnd = () => {
    setPhase("done");
    onOpen();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b1840",
        opacity: phase === "done" ? 0 : 1,
        transition: "opacity 0.8s ease",
        cursor: phase === "idle" ? "pointer" : "default",
        overflow: "hidden",
      }}
      onClick={handleClick}
    >
      {/* Imagen del sobre — visible en idle */}
      <img
        src={SOBRE_IMG}
        alt="Sobre de invitación XV Camila Esther"
        width={360}
        height={640}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: phase === "idle" ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Video de apertura — visible durante reproducci&oacute;n */}
      <video
        ref={videoRef}
        src={SOBRE_VIDEO}
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: phase === "video" ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Bot&oacute;n inferior */}
      <span
        style={{
          position: "absolute",
          bottom: 56,
          zIndex: 2,
          background: "var(--gold-grad)",
          border: "1.5px solid #8a6a1f",
          fontFamily: "var(--font-cormorant, serif)",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: ".3em",
          textTransform: "uppercase",
          color: "#2a1f08",
          padding: "14px 38px",
          borderRadius: 50,
          boxShadow: "0 6px 20px rgba(156,122,60,.22)",
          opacity: phase === "idle" ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      >
        Toca para abrir
      </span>
    </div>
  );
}
