import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

const features = [
  "Acceso a SER SELECCIONADO",
  "Acceso a SORTEOS EXCLUSIVOS",
  "Acceso a Promociones de Filmación",
  "Acceso a CONTENIDO y FORMACIÓN",
  "Soporte del equipo Iwon",
  "Cancelá cuando quieras",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-iwon-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Un solo plan. <span className="text-gold">Todo incluido.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sin planes confusos ni costos ocultos. Un precio accesible para impulsar tu carrera.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="relative p-8 rounded-2xl bg-iwon-card border-2 border-gold/50 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gold/5 rounded-full blur-3xl" />

            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold mb-6">
                Plan único
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold font-mono text-gold">$14.999</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Pesos argentinos - Sin compromiso</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href="/register">
                <Button className="w-full bg-gold hover:bg-gold-light text-black font-bold text-lg py-6 h-auto">
                  Suscribite ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
