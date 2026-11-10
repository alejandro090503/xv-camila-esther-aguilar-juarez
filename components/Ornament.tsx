export default function Ornament({ bottom = false }: { bottom?: boolean }) {
  return (
    <div className={`orn${bottom ? " bot" : ""}`}>
      <span className="orn-diamond-sm" />
      <span className="orn-line" />
      <span className="orn-diamond" />
      <span className="orn-line" />
      <span className="orn-diamond-sm" />
    </div>
  );
}
