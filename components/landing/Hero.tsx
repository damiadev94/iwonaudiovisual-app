import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-iwon-bg via-iwon-bg to-iwon-bg-secondary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />

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
          <span className="text-sm text-gold">Convocatoria abierta - Abril 2026</span>
        </div>

        {/* Main title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          Vamos a seleccionar a los{" "}
          <span className="text-gold">50 mejores artistas</span>{" "}
          y filmarles su disco.
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-muted-foreground mb-4">
          Con equipamiento de cine.
        </p>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
          Iwon Audiovisual es la plataforma de impulso para artistas independientes en Argentina.
          Suscribite y accede a produccion real, cursos, sorteos y promos de filmacion.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/register">
            <Button size="lg" className="bg-gold hover:bg-gold-light text-black font-bold text-lg px-8 py-6 h-auto">
              Suscribite por $9.999/mes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="#portfolio">
            <Button size="lg" variant="outline" className="border-iwon-border hover:bg-iwon-card text-lg px-8 py-6 h-auto">
              <Play className="mr-2 h-5 w-5" />
              Ver portfolio
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div>
            <p className="text-3xl font-bold text-gold font-mono">+450</p>
            <p className="text-sm text-muted-foreground">Videoclips</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gold font-mono">+200</p>
            <p className="text-sm text-muted-foreground">Artistas</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gold font-mono">5</p>
            <p className="text-sm text-muted-foreground">Anos de trayectoria</p>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-iwon-bg-secondary to-transparent" />
    </section>
  );
}
