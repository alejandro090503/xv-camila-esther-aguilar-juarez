export default function Familia() {
  return (
    <section id="familia" className="sec" style={{ textAlign: "center" }}>
      <span className="eyebrow">Con la bendici&oacute;n de</span>
      <h2 className="heading-sm">Mis Padres</h2>

      <div className="orn" style={{ maxWidth: 180, margin: "12px auto 28px" }}>
        <span className="orn-line" />
        <span className="orn-diamond" />
        <span className="orn-line" />
      </div>

      <div className="fam-card fx-stagger">
        <span className="fam-name">V&iacute;ctor Aguilar</span>
        <div className="fam-and">
          <span className="fam-and-line" />
          <span className="fam-and-txt">&amp;</span>
          <span className="fam-and-line" />
        </div>
        <span className="fam-name">Anayeli Ju&aacute;rez</span>
      </div>

      <div className="fx-stagger" style={{ marginTop: 34 }}>
        <span className="italiana" style={{ display: "block", textAlign: "center", marginBottom: 14 }}>
          Agradecimiento
        </span>
        <p className="sub" style={{ margin: "0 auto", maxWidth: 330, fontSize: 19 }}>
          Agradecemos a todas las personas que se sumaron hacer este d&iacute;a tan especial
          a Dios por darme la existencia y la raz&oacute;n de vivir este momento.
        </p>
      </div>

      <div className="fx-stagger salmo" style={{ marginTop: 34 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block", margin: "0 auto 12px" }}>
          <path d="M12 1 L13.6 10.4 L23 12 L13.6 13.6 L12 23 L10.4 13.6 L1 12 L10.4 10.4 Z" fill="#D4AF37" />
        </svg>
        <p className="sub" style={{ margin: "0 auto", maxWidth: 330, fontSize: 19 }}>
          &ldquo;Porque t&uacute; formaste mis entra&ntilde;as; T&uacute; me hiciste en el vientre de mi madre.
          Te alabar&eacute;; porque formidables, maravillosas son tus obras; Estoy maravillado,
          Y mi alma lo sabe muy bien.&rdquo;
        </p>
        <span className="salmo-cita">Salmos 139:13-14 RVR1960</span>
      </div>
    </section>
  );
}
