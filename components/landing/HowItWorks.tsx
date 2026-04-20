export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 px-5 md:px-10">
      <div className="flex items-center gap-2.5 text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
        <span>◆</span>
        <span>El concepto</span>
      </div>

      <h2
        className="font-condensed font-black uppercase leading-[0.9] tracking-[-0.01em]"
        style={{ fontSize: "clamp(42px, 7vw, 80px)" }}
      >
        No firmamos
        <br />
        artistas.
        <br />
        <span className="text-gold">
          Te damos las
          <br />
          oportunidades.
        </span>
      </h2>

      {/* Brutalista concept grid: tall left cell + 2 right cells */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-px mt-16 border border-iwon-border"
        style={{ background: "var(--color-iwon-border)" }}
      >
        {/* Cell 01 — spans 2 rows on md+ */}
        <div className="bg-iwon-card p-8 md:p-10 flex flex-col justify-between md:row-span-2">
          <div>
            <div className="font-condensed font-black text-[80px] leading-none text-gold/10">01</div>
            <div className="font-condensed font-extrabold text-[26px] md:text-[28px] uppercase tracking-[0.02em] mt-4 mb-3 leading-tight">
              La primera productora audiovisual del país para artistas urbanos
              independientes
            </div>
            <div className="text-sm text-muted-foreground leading-[1.7]">
              Cada 4 meses abrimos convocatoria. Los 50 mejores artistas reciben
              5 videoclips profesionales filmados con equipamiento de cine. Sin
              costo adicional.
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-iwon-border">
            <div className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground mb-2">
              Valor por seleccionado
            </div>
            <div className="font-condensed font-black text-[40px] text-gold leading-none">
              +USD $1.500
            </div>
          </div>
        </div>

        {/* Cell 02 */}
        <div className="bg-iwon-card p-8 md:p-10">
          <div className="font-condensed font-black text-[48px] leading-none text-gold/10">02</div>
          <div className="font-condensed font-extrabold text-[26px] uppercase tracking-[0.02em] mt-4 mb-3">
            Resultado en 10 días
          </div>
          <div className="text-sm text-muted-foreground leading-[1.7]">
            Mandás tu demo. Nosotros evaluamos por mérito. En 10 días sabés si
            quedaste. Sin azar, sin palancas.
          </div>
        </div>

        {/* Cell 03 */}
        <div className="bg-iwon-card p-8 md:p-10">
          <div className="font-condensed font-black text-[48px] leading-none text-gold/10">03</div>
          <div className="font-condensed font-extrabold text-[26px] uppercase tracking-[0.02em] mt-4 mb-3">
            Libertad creativa total
          </div>
          <div className="text-sm text-muted-foreground leading-[1.7]">
            Elegís vos qué canciones filmar. Se filma a tu ritmo. 1-2 revisiones
            incluidas por videoclip.
          </div>
        </div>
      </div>
    </section>
  );
}
