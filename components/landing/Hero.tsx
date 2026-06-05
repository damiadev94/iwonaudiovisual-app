import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";
import { formatPromoEndDate } from "@/lib/promo";

interface HeroProps {
  promoEndDate: Date | null;
}

export function Hero({ promoEndDate }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-iwon-bg via-iwon-bg to-iwon-bg-secondary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5 mb-8">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-sm text-gold">Junio 2026 — Inscribite ahora</span>
        </div>

        {/* Main title */}
        <div className="relative">
          {/* Blur blobs behind title */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div className="absolute w-[480px] h-[280px] rounded-full bg-gold/10 blur-[80px] translate-y-4" />
            <div className="absolute w-[320px] h-[180px] rounded-full bg-white/5 blur-[60px] -translate-y-6 translate-x-8" />
          </div>

        <h1 className="leading-none mb-6 uppercase">
          <span className="block text-xl sm:text-2xl md:text-3xl font-light tracking-[0.18em] text-white/40 mb-1">
            este mes,
          </span>
          <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-none">
            TODOS
          </span>
          <span className="block text-xl sm:text-2xl md:text-3xl font-light tracking-[0.22em] text-white/40 my-1">
            los suscriptores
          </span>
          <span className="block text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter text-gold leading-none italic">
            GANAN
          </span>
          <span className="block text-xl sm:text-2xl md:text-3xl font-light tracking-[0.12em] text-white/30 mt-1">
            un videoclip en{" "}
            <span className="text-gold/80 font-semibold">1 toma</span>
          </span>
        </h1>
        </div>

        {/* Subtitle — adjusted when promo is active */}
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-10 px-2 sm:px-0">
          {promoEndDate ? (
            <>
              Iwon Audiovisual es la plataforma de impulso para artistas independientes en Argentina.
              Accedé <span className="text-gold font-medium">gratis hasta el {formatPromoEndDate(promoEndDate)}</span> y
              participá en selecciones, sorteos, cursos y promos de filmación.
            </>
          ) : (
            <>
              Iwon Audiovisual es la plataforma de impulso para artistas independientes en Argentina.
              Suscribite y accedé a ser elegido, cursos, sorteos y promos de filmación.
            </>
          )}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-16 w-full max-w-lg mx-auto sm:max-w-none">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-gold hover:bg-gold-light text-black font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto">
              {promoEndDate
                ? `Accedé gratis hasta el ${formatPromoEndDate(promoEndDate)}`
                : "Suscribite por $14.999/mes"}
              <ArrowRight className="ml-2 h-5 w-5 shrink-0" />
            </Button>
          </Link>
          <a href="#portfolio" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-iwon-border hover:bg-iwon-card text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto">
              <Play className="mr-2 h-5 w-5 shrink-0" />
              {promoEndDate ? `Ver videoclips` : `QUIERO MI ONESHOT GRATIS`}
            </Button>
          </a>
        </div>

        {/* Instagram pill */}
        <div className="flex justify-center mb-12">
          <a
            href="https://www.instagram.com/iwon.audiovisual"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gold/40 bg-white/5 backdrop-blur-md hover:bg-gold/10 hover:border-gold/70 transition-all duration-300"
          >
            {/* Instagram icon */}
            <svg
              className="w-4 h-4 text-gold flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
              Entra a mi Instagram y enterate de todo
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-gold opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div>
            <p className="text-3xl font-bold text-gold font-mono">+450</p>
            <p className="text-sm text-muted-foreground">Videoclips filmados</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gold font-mono">+500</p>
            <p className="text-sm text-muted-foreground">Artistas</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gold font-mono">3</p>
            <p className="text-sm text-muted-foreground">Años de trayectoria</p>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-iwon-bg-secondary to-transparent" />
    </section>
  );
}
