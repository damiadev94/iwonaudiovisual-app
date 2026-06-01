const benefits = [
  {
    num: "01",
    tag: "Registro",
    title: "Totalmente gratuito",
    body: "Sin tarjeta, sin compromiso. Te registrás y ya sos parte de la comunidad Iwon.",
  },
  {
    num: "02",
    tag: "Sorteo mensual",
    title: "Videoclip en una toma",
    body: "Cada mes sorteamos un videoclip filmado con equipamiento de cine. Participás automáticamente solo por estar registrado.",
  },
  {
    num: "03",
    tag: "Formación",
    title: "Cursos de negocio musical",
    body: "Finanzas, marketing, branding, distribución. Lo que no te enseña YouTube.",
  },
  {
    num: "04",
    tag: "Producción",
    title: "Promos de filmación",
    body: "Cupos exclusivos a precio especial para registrados. Un videoclip profesional accesible.",
  },
];

export function BenefitsSection() {
  return (
    <section style={{ padding: "100px 40px", background: "#111111" }}>
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
        — Qué recibís desde el día 1
      </div>

      {/* Benefits grid — responsive via Tailwind classes */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{
          gap: "1px",
          background: "#2A2A2A",
          border: "1px solid #2A2A2A",
          marginTop: "60px",
        }}
      >
        {benefits.map((b) => (
          <div
            key={b.num}
            className="benefit-card"
            style={{
              background: "#161616",
              padding: "36px 28px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Animated bottom line — activated by .benefit-card:hover .benefit-line in globals.css */}
            <div
              className="benefit-line"
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "#D4A843",
                transform: "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.3s",
              }}
            />
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#D4A843",
                marginBottom: "20px",
              }}
            >
              {b.num} — {b.tag}
            </div>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontWeight: 800,
                fontSize: "20px",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                marginBottom: "10px",
              }}
            >
              {b.title}
            </div>
            <div style={{ fontSize: "13px", color: "#888", lineHeight: 1.6 }}>{b.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
