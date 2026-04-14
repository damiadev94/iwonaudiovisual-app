"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Que es IWON?",
    answer:
      "Somos la productora audiovisual low cost que mas crece en Argentina. Filmamos ya mas de 500 videos en 3 años. Damos oportunidades TODOS LOS MESES de ser seleccionado, filmar con calidad de cine, ganarte un Video, Ep o un DISCO, acceder a promociones, ver contenido que se actualiza todo el tiempo y mostrar tu musica por el precio de una suscripción.",
  },
  {
    question: "Que incluye la suscripcion?",
    answer:
      "La suscripcion te da acceso a: SER SELECCIONADO, SORTEOS EXCLUSIVOS, Promociones de Filmacion, y CONTENIDO y FORMACION.",
  },
  {
    question: 'Que es la Seleccion "Los 50"?',
    answer:
      "Es nuestra apuesta principal. Periodicamente seleccionamos a 50 artistas de la comunidad para filmarles su mejor cancion con equipamiento de cine profesional. Solo los suscriptores activos pueden aplicar.",
  },
  {
    question: "Hay permanencia minima?",
    answer:
      "No. Podes cancelar tu suscripcion cuando quieras sin penalidades. Tu acceso se mantiene hasta el final del periodo de facturacion.",
  },
  {
    question: "Como son las promos de filmacion?",
    answer:
      "Son oportunidades de filmacion a precios muy por debajo del mercado, exclusivas para suscriptores. Cupos limitados.",
  },
  {
    question: "Que generos musicales aceptan?",
    answer:
      "Filmamos todo genero, no tenemos problemas.",
  },
  {
    question: "Como funcionan los sorteos?",
    answer:
      "Realizamos sorteos periodicos de premios como sesiones de VIDEOCLIPS, EP y DISCOS. Solo podes participar si tu suscripcion esta activa. Un click y ya estas participando.",
  },
  {
    question: "Que equipamiento usan para filmar?",
    answer:
      "Usamos equipamiento de cine profesional. Camaras, lentes, iluminacion y todo el equipamiento necesario para una produccion de nivel cinematografico.",
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
            Todo lo que necesitas saber antes de suscribirte.
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
