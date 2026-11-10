/** Divisor en forma de remolino de Van Gogh; se dibuja al entrar en pantalla. */
export default function Swirl() {
  return (
    <div style={{ padding: "18px 0 6px" }}>
      <svg className="swirl" viewBox="0 0 220 40" aria-hidden="true">
        <defs>
          <linearGradient id="swirlGold" x1="0" x2="1">
            <stop offset="0" stopColor="#D4AF37" stopOpacity="0" />
            <stop offset=".25" stopColor="#b8922a" />
            <stop offset=".5" stopColor="#4A7BB7" />
            <stop offset=".75" stopColor="#b8922a" />
            <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M2 24 C30 24 46 10 70 14 C88 17 92 30 106 28 C118 26 118 14 110 12 C102 10 98 20 106 22 C116 25 128 12 150 14 C176 16 190 26 218 22" />
        <circle cx="110" cy="6" r="1.8" />
        <circle cx="64" cy="32" r="1.2" />
        <circle cx="160" cy="32" r="1.2" />
      </svg>
    </div>
  );
}
