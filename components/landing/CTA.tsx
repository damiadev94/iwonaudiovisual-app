import Link from "next/link";

export function CTA() {
  return (
    <section className="py-30 px-5 md:px-10 text-center relative overflow-hidden">
      {/* Watermark — técnica de marcas de ropa urbana */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-condensed font-black whitespace-nowrap pointer-events-none select-none"
        style={{
          fontSize: "22vw",
          color: "rgba(201,168,76,0.04)",
          letterSpacing: "-0.02em",
        }}
      >
        IWON
      </div>

      <h2
        className="relative font-condensed font-black uppercase leading-[0.9]"
        style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
      >
        Tu próximo videoclip
        <span className="block text-gold">ya tiene productora.</span>
      </h2>

      <p className="relative text-muted-foreground mt-6 mb-10 italic">
        Suscribite por $9.999/mes · Sin permanencia mínima
      </p>

      <Link href="/register" className="relative inline-block">
        <button
          className="bg-gold text-black font-condensed font-black text-[17px] uppercase tracking-[0.12em] px-16 py-5.5 cursor-pointer transition-all hover:bg-gold-light hover:-translate-y-0.5"
          style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
        >
          Suscribite ahora
        </button>
      </Link>
    </section>
  );
}
