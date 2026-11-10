/** Capa de tinta (estilo save the date Lekshmy) que fluye detrás de la sección. */
export default function InkBg({
  img,
  flip = false,
  dir = 1,
  delay = 0,
}: {
  img: "top" | "oval" | "corner" | "hero" | "footer";
  flip?: boolean;
  dir?: 1 | 2 | 3 | 4;
  delay?: number;
}) {
  return (
    <div className={`ink-bg${flip ? " flip" : ""}`} aria-hidden="true">
      <i
        className={`ink-d${dir}`}
        style={{ backgroundImage: `url(/ink/ink-${img}.webp)`, animationDelay: `${delay}s` }}
      />
    </div>
  );
}
