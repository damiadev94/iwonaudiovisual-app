"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Qué es IWON?",
    answer:
      "Somos la productora audiovisual low cost que más crece en Argentina. Filmamos ya más de 500 videos en 3 años. Damos oportunidades TODOS LOS MESES de ser seleccionado, filmar con calidad de cine, ganarte un Video, Ep o un DISCO, acceder a promociones, ver contenido que se actualiza todo el tiempo y mostrar tu música por el precio de una suscripción.",
  },
  {
    question: "¿Qué incluye la suscripción?",
    answer:
      "La suscripción te da acceso a: SER SELECCIONADO, SORTEOS EXCLUSIVOS, Promociones de Filmación, y CONTENIDO y FORMACIÓN.",
  },
  {
    question: '¿Qué es la Selección "Los 50"?',
    answer:
      "Es nuestra apuesta principal. Periódicamente seleccionamos a 50 artistas de la comunidad para filmarles su mejor canción con equipamiento de cine profesional. Solo los suscriptores activos pueden aplicar.",
  },
  {
    question: "¿Hay permanencia mínima?",
    answer:
      "No. Podés cancelar tu suscripción cuando quieras sin penalidades. Tu acceso se mantiene hasta el final del período de facturación.",
  },
  {
    question: "¿Cómo son las promos de filmación?",
    answer:
      "Son oportunidades de filmación a precios muy por debajo del mercado, exclusivas para suscriptores. Cupos limitados.",
  },
  {
    question: "¿Qué géneros musicales aceptan?",
    answer:
      "Filmamos todo género, no tenemos problema.",
  },
  {
    question: "¿Cómo funcionan los sorteos?",
    answer:
      "Realizamos sorteos periódicos de premios como sesiones de VIDEOCLIPS, EP y DISCOS. Solo podés participar si tu suscripción está activa. Un clic y ya estás participando.",
  },
  {
    question: "¿Qué equipamiento usan para filmar?",
    answer:
      "Usamos equipamiento de cine profesional. Cámaras, lentes, iluminación y todo el equipamiento necesario para una producción de nivel cinematográfico.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-iwon-bg-secondary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-muted-foreground">
            Todo lo que necesitás saber antes de suscribirte.
          </p>
        </div>

        <Accordion className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-iwon-border rounded-lg px-6 bg-iwon-card"
            >
              <AccordionTrigger className="text-left hover:no-underline hover:text-gold transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
