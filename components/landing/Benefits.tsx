import { BookOpen, Film, Trophy, Star, CheckCircle } from "lucide-react";

const benefits = [
  {
    icon: BookOpen,
    title: "Cursos de formacion",
    description: "Accede a cursos de finanzas, marketing, branding y distribucion musical desde el dia 1.",
    features: ["Finanzas para artistas", "Marketing digital", "Branding personal", "Distribucion musical"],
  },
  {
    icon: Film,
    title: "Promos de filmacion",
    description: "Reserva sesiones de filmacion a precios exclusivos. Cupos limitados.",
    features: ["Equipamiento de cine", "Equipo profesional", "Cupos limitados", "Precios accesibles"],
  },
  {
    icon: Trophy,
    title: "Sorteos exclusivos",
    description: "Participa en sorteos mensuales de videoclips, sesiones y mas premios.",
    features: ["Sorteos mensuales", "Videoclips gratis", "Sesiones de grabacion", "Solo suscriptores"],
  },
  {
    icon: Star,
    title: 'Seleccion "Los 50"',
    description: "Aplica para ser uno de los 50 artistas seleccionados y filmar tu disco completo.",
    features: ["Produccion completa", "Disco filmado", "Calidad cinematografica", "Seleccion periodica"],
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="py-24 bg-iwon-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Beneficios desde el <span className="text-gold">dia 1</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No es solo una suscripcion. Es un programa completo de impulso artistico con produccion real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="p-8 rounded-xl bg-iwon-card border border-iwon-border hover:border-gold/30 transition-all duration-300"
            >
              <benefit.icon className="h-10 w-10 text-gold mb-4" />
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground mb-6">{benefit.description}</p>
              <ul className="space-y-2">
                {benefit.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-gold shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
