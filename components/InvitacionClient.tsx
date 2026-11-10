"use client";
import { useState, useRef } from "react";
import SplashScreen from "./SplashScreen";
import Hero from "./Hero";
import Ornament from "./Ornament";
import CountdownTimer from "./CountdownTimer";
import Galeria from "./Galeria";
import Familia from "./Familia";
import Itinerario from "./Itinerario";
import Ubicacion from "./Ubicacion";
import DressCode from "./DressCode";
import MesaRegalos from "./MesaRegalos";
import AlbumQR from "./AlbumQR";
import SoloAdultos from "./SoloAdultos";
import RSVPSection from "./RSVPSection";
import Footer from "./Footer";
import MusicFab, { type MusicFabHandle } from "./MusicFab";
import Sparkles from "./Sparkles";
import ScrollReveal from "./ScrollReveal";
import NocheBand from "./NocheBand";
import Swirl from "./Swirl";
import MenuFlotante from "./MenuFlotante";
import FadeSections from "./FadeSections";
import AutoScroll from "./AutoScroll";
import InkBg from "./InkBg";

export default function InvitacionClient() {
  const [contentVisible, setContentVisible] = useState(false);
  const [splashMounted, setSplashMounted] = useState(true);
  const musicRef = useRef<MusicFabHandle>(null);

  const handleStart = () => {
    musicRef.current?.play();
  };

  const handleReveal = () => {
    setContentVisible(true);
    setTimeout(() => {
      setSplashMounted(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 820);
  };

  return (
    <>
      {splashMounted && <SplashScreen onStart={handleStart} onOpen={handleReveal} />}

      <div
        className="wrap"
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: "opacity 0.85s ease",
          background: "var(--soft)",
        }}
      >
        <Hero />

        <ScrollReveal>
          <Swirl />
        </ScrollReveal>

        <ScrollReveal bg="sec-paper">
          <Galeria />
        </ScrollReveal>

        <ScrollReveal>
          <Ornament />
        </ScrollReveal>

        <ScrollReveal bg="sec-alt" ink={<InkBg img="top" dir={1} />}>
          <Familia />
        </ScrollReveal>

        <ScrollReveal>
          <NocheBand>
            <section className="sec" style={{ padding: "100px 32px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", margin: "0 auto 16px" }}>
                <path d="M12 1 L13.6 10.4 L23 12 L13.6 13.6 L12 23 L10.4 13.6 L1 12 L10.4 10.4 Z" fill="#D4AF37" />
              </svg>
              <p className="vg-quote">
                &ldquo;No s&eacute; nada con certeza, pero ver las estrellas me hace so&ntilde;ar.&rdquo;
              </p>
              <span className="vg-firma">Vincent van Gogh</span>
            </section>
          </NocheBand>
        </ScrollReveal>

        <ScrollReveal>
          <NocheBand id="fecha">
            <CountdownTimer />
          </NocheBand>
        </ScrollReveal>

        <ScrollReveal bg="sec-alt" ink={<InkBg img="oval" dir={2} delay={-6} />}>
          <Ubicacion />
        </ScrollReveal>

        <ScrollReveal>
          <Swirl />
        </ScrollReveal>

        <ScrollReveal bg="sec-paper" ink={<InkBg img="corner" flip dir={3} delay={-11} />}>
          <Itinerario />
        </ScrollReveal>

        <ScrollReveal>
          <Ornament />
        </ScrollReveal>

        <ScrollReveal bg="sec-alt" ink={<InkBg img="top" flip dir={4} delay={-3} />}>
          <DressCode />
        </ScrollReveal>

        <ScrollReveal>
          <Swirl />
        </ScrollReveal>

        <ScrollReveal bg="sec-paper" ink={<InkBg img="oval" flip dir={1} delay={-15} />}>
          <MesaRegalos />
        </ScrollReveal>

        <ScrollReveal>
          <Ornament />
        </ScrollReveal>

        <ScrollReveal bg="sec-alt" ink={<InkBg img="corner" dir={2} delay={-8} />}>
          <AlbumQR />
        </ScrollReveal>

        <ScrollReveal>
          <Ornament />
        </ScrollReveal>

        <ScrollReveal bg="sec-deep">
          <SoloAdultos />
        </ScrollReveal>

        <ScrollReveal>
          <Swirl />
        </ScrollReveal>

        <ScrollReveal bg="sec-paper" ink={<InkBg img="top" dir={3} delay={-18} />}>
          <RSVPSection />
        </ScrollReveal>

        <Footer />
      </div>

      {contentVisible && <Sparkles />}

      <MenuFlotante visible={contentVisible} />
      <MusicFab ref={musicRef} visible={contentVisible} />
      <FadeSections ready={contentVisible} />
      <AutoScroll start={contentVisible} />
    </>
  );
}
