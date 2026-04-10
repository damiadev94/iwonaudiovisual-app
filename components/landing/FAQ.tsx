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
      "Somos la respuesta al problema más grande de la música independiente: la invisibilidad. En Iwon no solo filmamos videoclips, damos oportunidades TODOS LOS MESES de ser seleccionado, filmar con calidad de cine, ganarte un Video, Ep o un DISCO, acceder a promociones, ver contenido que se actualiza todo el tiempo y mostrar tu musica por el precio de una suscripción.",
  },
  {
    question: "Que incluye la suscripcion?",
    answer:
      'La suscripcion te da acceso a: cursos de formacion (finanzas, marketing, branding, distribucion), participacion en sorteos exclusivos, acceso a promos de filmacion a precios reducidos, y la posibilidad de aplicar a la Seleccion "Los 50" para filmar tu disco completo.',
  },
  {
    question: 'Que es la Seleccion "Los 50"?',
    answer:
      "Es nuestro programa principal. Periodicamente seleccionamos a los 50 mejores artistas de la comunidad para filmarles su disco completo con equipamiento de cine profesional. Solo los suscriptores activos pueden aplicar.",
  },
  {
    question: "Hay permanencia minima?",
    answer:
      "No. Podes cancelar tu suscripcion cuando quieras sin penalidades. Tu acceso se mantiene hasta el final del periodo de facturacion.",
  },
  {
    question: "Como son las promos de filmacion?",
    answer:
      "Son oportunidades de filmacion a precios muy por debajo del mercado, exclusivas para suscriptores. Los cupos son limitados a 200 artistas por promo.",
  },
  {
    question: "Que generos musicales aceptan?",
    answer:
      "Nos especializamos en musica urbana: trap, rap, RKT, reggaeton y generos afines. Si haces musica urbana independiente en Argentina, Iwon es para vos.",
  },
  {
    question: "Como funcionan los sorteos?",
    answer:
      "Realizamos sorteos periodicos de premios como sesiones de grabacion, videoclips y mas. Solo podes participar si tu suscripcion esta activa. Un click y ya estas participando.",
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
