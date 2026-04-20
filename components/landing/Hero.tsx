import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end px-5 md:px-10 pb-16 overflow-hidden">
      {/* Background: dark gradient + subtle gold grid */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0.3) 70%, rgba(10,10,10,0.6) 100%),
            repeating-linear-gradient(90deg, transparent, transparent 99px, rgba(201,168,76,0.04) 99px, rgba(201,168,76,0.04) 100px),
            repeating-linear-gradient(0deg, transparent, transparent 99px, rgba(201,168,76,0.04) 99px, rgba(201,168,76,0.04) 100px)
          `,
          backgroundColor: "#0d0d0d",
        }}
      />

      {/* Eyebrow */}
      <div className="relative flex items-center gap-3 mb-4 text-[11px] tracking-[0.25em] uppercase text-gold">
        <span className="block w-8 h-px bg-gold flex-shrink-0" />
        Productora audiovisual · Buenos Aires · Desde 2022
      </div>

      {/* Title — tres tratamientos: outline / blanco / dorado */}
      <h1
        className="relative font-condensed font-black uppercase leading-[0.88] tracking-[-0.01em]"
        style={{ fontSize: "clamp(72px, 12vw, 140px)" }}
      >
        <span
          className="block"
          style={{
            WebkitTextStroke: "1.5px rgba(242,237,228,0.25)",
            color: "transparent",
          }}
        >
          Vamos a
        </span>
        <span className="block text-foreground">seleccionar</span>
        <span className="block text-gold">a los mejores</span>
      </h1>

      {/* Subtitle */}
      <p className="relative text-base italic text-muted-foreground mt-7 max-w-[480px] leading-relaxed">
        y filmarles su disco con equipamiento de cine. Sin sellos, sin
        intermediarios. Solo tu música.
      </p>

      {/* CTAs */}
      <div className="relative flex flex-wrap items-center gap-6 mt-10">
        <Link href="/register">
          <button
            className="bg-gold text-black font-condensed font-black text-[15px] uppercase tracking-[0.12em] px-10 py-[18px] cursor-pointer transition-all hover:bg-gold-light hover:-translate-y-0.5"
            style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
          >
            Suscribite ahora
          </button>
        </Link>
        <a
          href="#portfolio"
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-foreground hover:text-gold transition-colors"
        >
          <span className="w-5 h-px bg-current" />
          Ver portfolio
        </a>
      </div>

      {/* Stats */}
      <div className="relative flex flex-wrap gap-10 mt-16">
        <div>
          <div className="font-condensed font-black text-[36px] text-gold leading-none">+450</div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">Videoclips filmados</div>
        </div>
        <div>
          <div className="font-condensed font-black text-[36px] text-gold leading-none">50</div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">Seleccionados por oleada</div>
        </div>
        <div>
          <div className="font-condensed font-black text-[36px] text-gold leading-none">$9.999</div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">por mes</div>
        </div>
      </div>
    </section>
  );
}
