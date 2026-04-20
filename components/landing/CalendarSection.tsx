import Image from "next/image";

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
      <div className="relative w-full h-[40vh] md:h-[45vh] overflow-hidden mb-16">
        <div className="absolute inset-y-0 right-0 left-0 md:left-[20%]">
          <Image
            src="/images/artista_independiente_landing_2.jpg"
            alt=""
            fill
            className="object-cover object-[center_0%] scale-110"
          />
          <div className="absolute inset-y-0 left-0 w-32 md:w-48 bg-linear-to-r from-iwon-bg to-transparent" />
        </div>

        <div className="absolute inset-y-0 left-0 w-3/4 bg-linear-to-r from-iwon-bg via-iwon-bg/70 to-transparent md:hidden" />
        <div className="absolute inset-0 bg-linear-to-t from-iwon-bg via-transparent to-iwon-bg/60 pointer-events-none" />

        <div className="absolute bottom-6 md:bottom-8 left-0">
          <div className="flex items-center gap-2.5 text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
            <span>◆</span>
            <span>El ciclo rotativo</span>
          </div>
          <h2
            className="font-condensed font-black uppercase leading-[0.9] tracking-[-0.01em]"
            style={{ fontSize: "clamp(36px, 7vw, 80px)" }}
          >
            Siempre hay
            <br />
            <span className="text-gold">algo pasando.</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {months.map((m) => (
          <div
            key={m.num}
            className={`border p-4 md:p-6 lg:p-7 ${
              m.active ? "border-gold bg-gold/[0.04]" : "border-iwon-border"
            }`}
          >
            <div
              className="font-condensed font-black text-[40px] md:text-[56px] lg:text-[64px] leading-none"
              style={{ color: m.active ? "rgba(201,168,76,0.2)" : "#2A2A2A" }}
            >
              {m.num}
            </div>
            <div
              className={`font-condensed font-extrabold text-[15px] md:text-[18px] uppercase tracking-[0.04em] mt-2 mb-1.5 leading-tight ${
                m.active ? "text-gold" : "text-foreground"
              }`}
            >
              {m.event}
            </div>
            <div className="text-[11px] md:text-[12px] text-muted-foreground leading-[1.6]">
              {m.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
