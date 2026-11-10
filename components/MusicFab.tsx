"use client";
import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";

export interface MusicFabHandle {
  play: () => void;
}

interface MusicFabProps {
  /** Se muestra con fundido solo después de abrir el sobre. */
  visible?: boolean;
}

const AUDIO_URL =
  "https://bsjoelxktbvlavfoozhk.supabase.co/storage/v1/object/public/fotos-clientes/audio/xv-camila-esther-aguilar-juarez/cancion.mp3";

const MusicFab = forwardRef<MusicFabHandle, MusicFabProps>(function MusicFab({ visible = true }, ref) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  // El estado visual sigue al audio real (por si se pausa/reanuda desde fuera).
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    a.addEventListener("play", on);
    a.addEventListener("pause", off);
    if (!a.paused) setPlaying(true);
    return () => {
      a.removeEventListener("play", on);
      a.removeEventListener("pause", off);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => {
      const a = audioRef.current;
      if (!a || !a.paused) return; // si ya suena, no reiniciar
      a.play().then(() => setPlaying(true)).catch(() => {});
    },
  }));

  const toggle = () => {
    window.dispatchEvent(new Event("autoscroll:stop"));
    const a = audioRef.current;
    if (!a) return;
    if (!a.paused) {
      a.pause();
      setPlaying(false);
    } else {
      a.muted = false;
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      <audio ref={audioRef} src={AUDIO_URL} loop preload="none" />
      <button
        id="music-btn"
        type="button"
        className={`mb-btn${visible ? " mb-visible" : ""}${playing ? " is-playing" : ""}`}
        onClick={toggle}
        aria-label={playing ? "Pausar música" : "Reproducir música de la invitación"}
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
      >
        <span className="mb-tonearm" aria-hidden="true">
          <span className="mb-tonearm-pivot" />
          <span className="mb-tonearm-line" />
          <span className="mb-tonearm-head" />
        </span>
        <span className="mb-spin" aria-hidden="true">
          <span className="mb-disc">
            <span className="mb-sheen" />
            <span className="mb-label-text">
              C E<small>XV</small>
            </span>
          </span>
        </span>
        <span className="mb-icons" aria-hidden="true">
          <svg className="mb-icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          <svg className="mb-icon-pause" viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
        </span>
      </button>
    </>
  );
});

export default MusicFab;
