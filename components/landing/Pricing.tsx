import Link from "next/link";

const features = [
  "Acceso total a cursos de formación",
  "Promos de filmación a $49.999",
  "Participación en sorteos mensuales",
  'Aplicación a "Los 50" cada 4 meses',
  "5 videoclips profesionales si sos seleccionado",
  "Cancelás cuando quieras, sin cargos",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-5 md:px-10 bg-[#111111]">
      <div className="flex items-center gap-2.5 text-[10px] tracking-[0.3em] uppercase text-gold mb-16">
        <span>◆</span>
        <span>La inversión</span>
      </div>

      <div className="max-w-170 mx-auto border border-gold">
        {/* Header */}
        <div className="p-8 md:p-12 border-b border-iwon-border flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Membresía mensual
            </div>
            <div className="font-condensed font-black text-[56px] md:text-[72px] leading-none text-gold">
              $9.999
            </div>
            <div className="text-base text-muted-foreground mt-2">
              ARS por mes · Sin permanencia mínima
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
              Valor potencial
            </div>
            <div className="font-condensed font-black text-[28px] text-gold leading-tight">
              +$1.500.000 ARS
            </div>
            <div className="text-xs text-muted-foreground">
              si quedás entre Los 50
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-px"
          style={{ background: "var(--color-iwon-border)" }}
        >
          {features.map((f) => (
            <div
              key={f}
              className="bg-iwon-card px-6 md:px-8 py-5 flex items-center gap-3"
            >
              <div
                className="w-1.5 h-1.5 bg-gold shrink-0"
                style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
              />
              <span className="text-[13px] leading-snug">{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-8 md:px-12 py-8 flex justify-center">
          <Link href="/register">
            <button
              className="bg-gold text-black font-condensed font-black text-base uppercase tracking-[0.12em] px-16 py-5 cursor-pointer transition-all hover:bg-gold-light hover:-translate-y-0.5"
              style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
            >
              Empezar ahora
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
