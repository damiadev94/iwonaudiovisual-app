const benefits = [
  {
    num: "01",
    tag: "Formación",
    title: "Cursos de negocio musical",
    body: "Finanzas, marketing, branding, distribución. Lo que no te enseña YouTube.",
  },
  {
    num: "02",
    tag: "Producción",
    title: "Promos de filmación",
    body: "200 cupos por mes. $49.999 por videoclip profesional. Solo para suscriptores.",
  },
  {
    num: "03",
    tag: "Sorteos",
    title: "Videoclips sorteados",
    body: "Cada mes sorteamos servicios profesionales. Participás automáticamente.",
  },
  {
    num: "04",
    tag: "Selección",
    title: "Los 50 — Cada 4 meses",
    body: "Los 50 mejores reciben su disco filmado. 5 videoclips con equipamiento de cine.",
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="py-24 px-5 md:px-10 bg-[#111111]">
      <div className="flex items-center gap-2.5 text-[10px] tracking-[0.3em] uppercase text-gold mb-16">
        <span>◆</span>
        <span>Qué recibís desde el día 1</span>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-iwon-border"
        style={{ background: "var(--color-iwon-border)" }}
      >
        {benefits.map((b) => (
          <div
            key={b.num}
            className="relative bg-iwon-card px-7 py-9 overflow-hidden group"
          >
            {/* Gold underline on hover */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
            <div className="text-[11px] tracking-[0.2em] uppercase text-gold mb-5">
              {b.num} ◆ {b.tag}
            </div>
            <div className="font-condensed font-extrabold text-[20px] uppercase tracking-[0.03em] mb-2.5 leading-tight">
              {b.title}
            </div>
            <div className="text-[13px] text-muted-foreground leading-[1.6]">
              {b.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
