const months = [
  {
    num: "01",
    event: "Sorteo de videoclip",
    desc: "Se sortea un videoclip filmado con equipamiento de cine entre todos los registrados.",
    active: true,
  },
  {
    num: "02",
    event: "Promos de filmación",
    desc: "Cupos exclusivos a precio especial. Un videoclip profesional solo para la comunidad.",
    active: false,
  },
  {
    num: "03",
    event: "Cursos nuevos",
    desc: "Nueva tanda de formación estratégica: marketing, branding y distribución musical.",
    active: false,
  },
  {
    num: "04",
    event: "Nuevo sorteo",
    desc: "El ciclo se repite. Seguís participando automáticamente mes a mes.",
    active: false,
  },
];

export function CalendarSection() {
  return (
    <section style={{ padding: "100px 40px" }}>
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#D4A843",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        — El ciclo rotativo
      </div>

      <div
        style={{
          fontFamily: "var(--font-condensed)",
          fontWeight: 900,
          fontSize: "clamp(42px, 7vw, 80px)",
          textTransform: "uppercase",
          lineHeight: 0.9,
          letterSpacing: "-0.01em",
          maxWidth: "600px",
        }}
      >
        Siempre hay
        <br />
        <em style={{ fontStyle: "normal", color: "#D4A843" }}>algo pasando.</em>
      </div>

      {/* Calendar grid — responsive via Tailwind classes */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: "16px", marginTop: "60px" }}
      >
        {months.map((m) => (
          <div
            key={m.num}
            style={{
              border: `1px solid ${m.active ? "#D4A843" : "#2A2A2A"}`,
              padding: "28px 24px",
              background: m.active ? "rgba(212,168,67,0.04)" : "transparent",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontWeight: 900,
                fontSize: "64px",
                lineHeight: 1,
                color: m.active ? "rgba(212,168,67,0.2)" : "#2A2A2A",
              }}
            >
              {m.num}
            </div>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontWeight: 800,
                fontSize: "18px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                margin: "8px 0",
                color: m.active ? "#D4A843" : "#F2EDE4",
              }}
            >
              {m.event}
            </div>
            <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.6 }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
