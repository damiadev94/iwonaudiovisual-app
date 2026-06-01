import { ButtonPrimary } from "@/components/ui/ButtonPrimary";

const features = [
  "Acceso total a cursos de formación",
  "Promos de filmación a $49.999",
  "Participación en sorteos mensuales",
  'Aplicación a "Los 50" cada 4 meses',
  "5 videoclips profesionales si sos seleccionado",
  "Cancelás cuando querés, sin cargos",
];

export function PricingSection() {
  return (
    <section id="precios" style={{ padding: "100px 40px", background: "#111111" }}>
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
        — La inversión
      </div>

      <div
        style={{
          maxWidth: "680px",
          margin: "60px auto 0",
          border: "1px solid #D4A843",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "48px",
            borderBottom: "1px solid #2A2A2A",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#888",
              }}
            >
              Membresía mensual
            </div>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontWeight: 900,
                fontSize: "72px",
                lineHeight: 1,
                color: "#D4A843",
              }}
            >
              $14.999
            </div>
            <div style={{ fontSize: "16px", color: "#888", marginTop: "8px" }}>
              ARS por mes · Sin permanencia mínima
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#888",
              }}
            >
              Valor potencial
            </div>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontWeight: 900,
                fontSize: "28px",
                color: "#D4A843",
              }}
            >
              +$1.500.000 ARS
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>si quedás entre Los 50</div>
          </div>
        </div>

        {/* Features grid — responsive */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2"
          style={{ gap: "1px", background: "#2A2A2A" }}
        >
          {features.map((f) => (
            <div
              key={f}
              style={{
                background: "#161616",
                padding: "20px 32px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: "6px",
                  height: "6px",
                  background: "#D4A843",
                  flexShrink: 0,
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              />
              <div style={{ fontSize: "13px", lineHeight: 1.4 }}>{f}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: "32px 48px", display: "flex", justifyContent: "center" }}>
          <ButtonPrimary href="/register" size="lg">
            Empezar ahora
          </ButtonPrimary>
        </div>
      </div>
    </section>
  );
}
