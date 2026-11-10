"use client";
import { useEffect, useRef, type ReactNode } from "react";

export default function ScrollReveal({ children, bg, ink }: { children: ReactNode; bg?: string; ink?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("visible");
          io.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`rv${bg ? " " + bg : ""}${ink ? " has-ink" : ""}`}>
      {ink}
      {children}
    </div>
  );
}
