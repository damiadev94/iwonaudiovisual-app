"use client";

import { useState } from "react";

const faqs = [
  {
    q: "¿Es caro?",
    a: "$14.999 por mes es menos que una pizza y medialunas. El premio potencial vale millones. Un videoclip profesional sale mínimo $200.000. Acá podés conseguir cinco.",
  },
  {
    q: "¿Pago y me quedo esperando?",
    a: "No. Desde el día 1 tenés acceso a cursos, podés reservar promos de filmación y participar en sorteos. El calendario rotativo elimina los tiempos muertos.",
  },
  {
    q: "¿Y si no quedo entre los 50?",
    a: "Seguís teniendo cursos, sorteos de videoclip guionado y promos de filmación a precio preferencial. Y podés volver a aplicar en la próxima oleada.",
  },
  {
    q: "¿Los temas los elijo yo?",
    a: "Sí. Libertad creativa total. Vos elegís qué canciones filmar. Se filma a tu ritmo, con un plazo razonable. Incluye 1-2 revisiones por videoclip.",
  },
  {
    q: "¿Siempre eligen a los mismos?",
    a: "No. Se priorizan caras nuevas en cada oleada. La selección es por mérito musical, no por antigüedad ni seguidores.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

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
        — Preguntas frecuentes
      </div>

      <dl style={{ maxWidth: "720px", marginTop: "60px" }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{ borderBottom: "1px solid #2A2A2A", overflow: "hidden" }}
          >
            <dt>
              <button
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "24px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#F2EDE4",
                  textAlign: "left",
                  fontFamily: "var(--font-condensed)",
                  fontWeight: 700,
                  fontSize: "18px",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                {faq.q}
                <span
                  aria-hidden="true"
                  style={{
                    width: "20px",
                    height: "20px",
                    flexShrink: 0,
                    border: "1px solid #2A2A2A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    color: "#D4A843",
                    transform: open === i ? "rotate(45deg)" : "none",
                    transition: "transform 0.3s",
                  }}
                >
                  +
                </span>
              </button>
            </dt>
            <dd
              style={{
                maxHeight: open === i ? "200px" : "0",
                overflow: "hidden",
                transition: "max-height 0.4s ease",
                fontSize: "14px",
                color: "#888",
                lineHeight: 1.7,
                paddingBottom: open === i ? "24px" : "0",
                margin: 0,
              }}
            >
              {faq.a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
