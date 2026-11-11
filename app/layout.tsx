import type { Metadata, Viewport } from "next";
import { Italiana, Pinyon_Script, Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import "./noche.css";
import "./fx-core.css";
import "./fx-galeria.css";
import "./fx-rsvp-vinilo.css";
import "./fx-dress-sobres.css";
import "./fx-hero.css";
import "./fx-regalo.css";

const italiana = Italiana({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-italiana",
  display: "swap",
});

const pinyon = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pinyon",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

const URL = "https://xv-camila-esther-aguilar-juarez.vercel.app";
const TITLE = "Mis XV Años · Camila Esther · 16 de enero de 2027";
const DESC = "Te invito a celebrar mis XV años · Sábado 16 de enero de 2027 · Ciudad de México";

export const metadata: Metadata = {
  metadataBase: new globalThis.URL(URL),
  title: TITLE,
  description: DESC,
  openGraph: {
    title: TITLE,
    description: DESC,
    url: URL,
    type: "website",
    images: [{ url: `${URL}/og-image.jpg?v=2`, width: 1200, height: 630, type: "image/jpeg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1840",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${italiana.variable} ${pinyon.variable} ${cormorant.variable} ${jost.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
