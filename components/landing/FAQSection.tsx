"use client";

import { useState } from "react";

const faqs = [
  {
    q: "¿El registro es realmente gratis?",
    a: "Sí, 100% gratis. Sin tarjeta de crédito, sin costos ocultos, sin permanencia. Te registrás y ya sos parte de la comunidad.",
  },
  {
    q: "¿Cómo funciona el sorteo?",
    a: "Cada mes sorteamos un videoclip filmado con equipamiento de cine entre todos los usuarios registrados. La participación es automática: no tenés que hacer nada más que estar registrado.",
  },
  {
    q: "¿Qué tipo de videoclip sortean?",
    a: "Un videoclip simple, en una toma, filmado con equipamiento profesional de cine. Rápido, real y de alta calidad.",
  },
  {
    q: "¿Los temas los elijo yo?",
    a: "Sí. Si ganás el sorteo, vos elegís qué canción filmar. Libertad creativa total.",
  },
  {
    q: "¿Qué más obtengo al registrarme?",
    a: "Acceso a cursos de formación musical (marketing, branding, distribución) y promos de filmación a precio especial para registrados.",
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
