export default function Footer() {
  return (
    <footer id="footer" className="noche-foot">
      <div className="noche-bg foot-bg" aria-hidden="true" style={{ ["--noche-img" as string]: "url(/fondos/pie.webp)" } as React.CSSProperties} />
      <span className="foot-name">Camila Esther</span>
      <p className="footer-date">Mis XV A&ntilde;os &middot; 16 de enero de 2027</p>

      <div className="footer-hr" />

      <a
        href="https://www.instagram.com/elysium.invitaciones/"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-credit"
      >
        Dise&ntilde;o por @elysium.invitaciones
      </a>
    </footer>
  );
}
