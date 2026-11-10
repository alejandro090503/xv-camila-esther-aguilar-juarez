export default function SoloAdultos() {
  return (
    <section id="aviso" className="sec-sm" style={{ textAlign: "center" }}>
      <span className="eyebrow">Un aviso importante</span>

      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 14px", opacity: 0.85 }}>
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="16" y1="11" x2="22" y2="11" />
      </svg>

      <p className="sub" style={{ margin: "0 auto", maxWidth: 320 }}>
        Con mucho cari&ntilde;o les pedimos que este sea un evento &uacute;nicamente para
        adultos. Agradezco mucho su comprensi&oacute;n.
      </p>
    </section>
  );
}
