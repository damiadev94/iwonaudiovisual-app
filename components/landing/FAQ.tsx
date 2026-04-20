"use client";

import { useState } from "react";

const faqs = [
  {
    q: "¿Es caro?",
    a: "$9.999 por mes es menos que una pizza y medialunas. El premio potencial vale millones. Un videoclip profesional sale mínimo $200.000. Acá podés conseguir cinco.",
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
  {
    q: "¿Qué géneros musicales aceptan?",
    a: "Filmamos todo género, no tenemos problema.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-5 md:px-10">
      <div className="flex items-center gap-2.5 text-[10px] tracking-[0.3em] uppercase text-gold mb-16">
        <span>◆</span>
        <span>Preguntas frecuentes</span>
      </div>

      <div className="max-w-180">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border-b border-iwon-border cursor-pointer"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div className="py-6 flex justify-between items-center gap-4 font-condensed font-bold text-[18px] uppercase tracking-[0.02em]">
              <span>{faq.q}</span>
              <div
                className="w-5 h-5 shrink-0 border border-iwon-border flex items-center justify-center text-[14px] text-gold transition-transform duration-300"
                style={{ transform: open === i ? "rotate(45deg)" : "none" }}
              >
                +
              </div>
            </div>
            <div
              className="overflow-hidden text-[14px] text-muted-foreground leading-[1.7] transition-all duration-300"
              style={{
                maxHeight: open === i ? "200px" : "0",
                paddingBottom: open === i ? "24px" : "0",
              }}
            >
              {faq.a}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
