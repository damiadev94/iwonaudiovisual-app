export function ConceptSection() {
  return (
    <section id="como-funciona" style={{ padding: "100px 40px" }}>
      {/* Section tag */}
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
        — El concepto
      </div>

      {/* Big statement */}
      <div
        style={{
          fontFamily: "var(--font-condensed)",
          fontWeight: 900,
          fontSize: "clamp(42px, 7vw, 80px)",
          textTransform: "uppercase",
          lineHeight: 0.9,
          letterSpacing: "-0.01em",
        }}
      >
        No firmamos
        <br />
        artistas.
        <br />
        <em style={{ fontStyle: "normal", color: "#D4A843" }}>
          Te damos las
          <br />
          oportunidades.
        </em>
      </div>

      {/* Concept grid — responsive via Tailwind classes */}
      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{
          gap: "1px",
          background: "#2A2A2A",
          border: "1px solid #2A2A2A",
          marginTop: "60px",
        }}
      >
        {/* Cell 01 — spans 2 rows on desktop */}
        <div
          className="md:row-span-2"
          style={{
            background: "#161616",
            padding: "40px",
            borderRight: "1px solid #2A2A2A",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "32px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontWeight: 900,
                fontSize: "80px",
                lineHeight: 1,
                color: "rgba(212,168,67,0.12)",
              }}
            >
              01
            </div>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontWeight: 800,
                fontSize: "28px",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                margin: "16px 0 12px",
              }}
            >
              La primera productora audiovisual del país para artistas urbanos independientes
            </div>
            <div style={{ fontSize: "14px", color: "#888", lineHeight: 1.7 }}>
              Cada 4 meses abrimos convocatoria. Los 50 mejores artistas reciben 5 videoclips
              profesionales filmados con equipamiento de cine. Sin costo adicional.
            </div>
          </div>
          <div
            style={{
              paddingTop: "32px",
              borderTop: "1px solid #2A2A2A",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#888",
                marginBottom: "8px",
              }}
            >
              Valor por seleccionado
            </div>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontWeight: 900,
                fontSize: "40px",
                color: "#D4A843",
              }}
            >
              +USD $1.500
            </div>
          </div>
        </div>

        {/* Cell 02 */}
        <div style={{ background: "#161616", padding: "40px" }}>
          <div
            style={{
              fontFamily: "var(--font-condensed)",
              fontWeight: 900,
              fontSize: "48px",
              lineHeight: 1,
              color: "rgba(212,168,67,0.12)",
            }}
          >
            02
          </div>
          <div
            style={{
              fontFamily: "var(--font-condensed)",
              fontWeight: 800,
              fontSize: "28px",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              margin: "16px 0 12px",
            }}
          >
            Resultado en 10 días
          </div>
          <div style={{ fontSize: "14px", color: "#888", lineHeight: 1.7 }}>
            Mandás tu demo. Nosotros evaluamos por mérito. En 10 días sabés si quedaste. Sin azar,
            sin palancas.
          </div>
        </div>

        {/* Cell 03 */}
        <div style={{ background: "#161616", padding: "40px" }}>
          <div
            style={{
              fontFamily: "var(--font-condensed)",
              fontWeight: 900,
              fontSize: "48px",
              lineHeight: 1,
              color: "rgba(212,168,67,0.12)",
            }}
          >
            03
          </div>
          <div
            style={{
              fontFamily: "var(--font-condensed)",
              fontWeight: 800,
              fontSize: "28px",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              margin: "16px 0 12px",
            }}
          >
            Libertad creativa total
          </div>
          <div style={{ fontSize: "14px", color: "#888", lineHeight: 1.7 }}>
            Elegís vos qué canciones filmar. Se filma a tu ritmo. 1-2 revisiones incluidas por
            videoclip.
          </div>
        </div>
      </div>
    </section>
  );
}
