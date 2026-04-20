const months = [
  {
    num: "01",
    event: "Selección masiva",
    desc: "Convocatoria abierta. Audición de demos. Los 50 mejores reciben 5 videoclips.",
    active: true,
  },
  {
    num: "02",
    event: "Sorteo",
    desc: "Se sortea un videoclip con guión profesional entre todos los suscriptores activos.",
    active: false,
  },
  {
    num: "03",
    event: "Promos de filmación",
    desc: "200 cupos. Un videoclip en una toma. A $49.999. Solo para miembros.",
    active: false,
  },
  {
    num: "04",
    event: "Cursos nuevos",
    desc: "Nueva tanda de formación estratégica. Se calienta la próxima selección masiva.",
    active: false,
  },
];

export function CalendarSection() {
  return (
    <section className="py-24 px-5 md:px-10">
      <div className="flex items-center gap-2.5 text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
        <span>◆</span>
        <span>El ciclo rotativo</span>
      </div>

      <h2
        className="font-condensed font-black uppercase leading-[0.9] tracking-[-0.01em]"
        style={{ fontSize: "clamp(42px, 7vw, 80px)" }}
      >
        Siempre hay
        <br />
        <span className="text-gold">algo pasando.</span>
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
        {months.map((m) => (
          <div
            key={m.num}
            className={`border p-6 md:p-7 ${
              m.active
                ? "border-gold bg-gold/[0.04]"
                : "border-iwon-border"
            }`}
          >
            <div
              className="font-condensed font-black text-[56px] md:text-[64px] leading-none"
              style={{ color: m.active ? "rgba(201,168,76,0.2)" : "#2A2A2A" }}
            >
              {m.num}
            </div>
            <div
              className={`font-condensed font-extrabold text-[18px] uppercase tracking-[0.04em] mt-2 mb-2 leading-tight ${
                m.active ? "text-gold" : "text-foreground"
              }`}
            >
              {m.event}
            </div>
            <div className="text-[12px] text-muted-foreground leading-[1.6]">
              {m.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
