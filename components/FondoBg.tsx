/** Fondo pintado (estilo Noche estrellada) que deriva lento detrás de la sección. */
export default function FondoBg({ name, dir = 1, delay = 0 }: { name: string; dir?: 1 | 2 | 3 | 4; delay?: number }) {
  return (
    <div className="fondo-bg" aria-hidden="true">
      <i className={`fondo-d${dir}`} style={{ backgroundImage: `url(/fondos/${name}.webp)`, animationDelay: `${delay}s` }} />
    </div>
  );
}
