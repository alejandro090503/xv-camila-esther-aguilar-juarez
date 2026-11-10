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
    </section>
  );
}
