"use client";
import { useEffect, useRef } from "react";

const Copa = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2h8l-1 7a3 3 0 0 1-6 0z" /><path d="M12 12v7" /><path d="M8 22h8" />
  </svg>
);
const Iglesia = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M10 4h4" /><path d="M6 10l6-4 6 4v12H6z" /><path d="M10 22v-5a2 2 0 0 1 4 0v5" />
  </svg>
);

const ITEMS = [
  { time: "5:00", event: "Recepción", Icon: Copa },
  { time: "5:30", event: "Ceremonia de 15 años", Icon: Iglesia },
];

export default function Itinerario() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const items = Array.from(box.querySelectorAll<HTMLElement>(".itin2-item"));
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("on")),
      { threshold: 0.4 }
    );
    items.forEach((i) => io.observe(i));

    // La línea se dibuja con el scroll (scrub)
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = box.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = (vh * 0.8 - r.top) / (r.height + vh * 0.3);
        box.style.setProperty("--prog", Math.max(0, Math.min(1, p)).toFixed(3));
      });
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      box.style.setProperty("--prog", "1");
    } else {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="itinerario" className="sec" style={{ textAlign: "center" }}>
      <span className="eyebrow">Programa</span>
      <h2 className="heading-sm">Itinerario</h2>

      <div className="orn" style={{ maxWidth: 180, margin: "12px auto 0" }}>
        <span className="orn-line" />
        <span className="orn-diamond" />
        <span className="orn-line" />
      </div>

      <div className="itin2" ref={ref}>
        <div className="itin2-line"><i /></div>
        {ITEMS.map(({ time, event, Icon }, i) => (
          <div className={`itin2-item ${i % 2 === 0 ? "l" : "r"}`} key={event}>
            <div className="itin2-ic"><Icon /></div>
            <div className="itin2-txt">
              <span className="itin2-time num">{time} p.m.</span>
              <span className="itin2-ev">{event}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
