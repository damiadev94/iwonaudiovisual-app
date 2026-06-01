const items = [
  "Los 50",
  "Videoclips profesionales",
  "Sin permanencia mínima",
  "Equipamiento de cine",
  "Conurbano · CABA · Argentina",
  "Sorteos mensuales",
  "Formación estratégica",
];

// Doubled so the ticker loops seamlessly
const doubled = [...items, ...items];

export function Ticker() {
  return (
    <div
      aria-hidden="true"
      style={{
        background: "#D4A843",
        padding: "14px 0",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ display: "inline-block", animation: "ticker 20s linear infinite" }}>
        {doubled.map((item, i) => (
          <span key={i}>
            <span
              style={{
                fontFamily: "var(--font-condensed)",
                fontWeight: 900,
                fontSize: "14px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#000",
                margin: "0 40px",
              }}
            >
              {item}
            </span>
            <span style={{ color: "rgba(0,0,0,0.35)", margin: "0 4px" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
