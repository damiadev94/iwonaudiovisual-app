import { BookOpen, Film, Trophy, Star, CheckCircle } from "lucide-react";

const benefits = [
  {
    icon: BookOpen,
    title: "Cursos de formación",
    description: "Accedé a ser elegida/o, sorteos, promociones, contenido y formación desde el día 1.",
    features: ["Negocio Musical", "Marca y Publicidad", "Lanzamientos y Campañas", "Estética e Industria"],
  },
  {
    icon: Film,
    title: "Promos de filmación",
    description: "Reservá tu videoclip por un precio que solo está disponible para SUSCRIPTORES.",
    features: ["Cupos limitados mes a mes", "One shots", "Videoclips", "Descuentos"],
  },
  {
    icon: Trophy,
    title: "Sorteos exclusivos",
    description: "Participá en sorteos mensuales de videoclips, EP O DISCO completo.",
    features: ["Sorteos mensuales", "Videoclips gratis", "EP o Disco completo"],
  },
  {
    icon: Star,
    title: "Selección de Artistas",
    description: "Mandanos tu canción para ser uno de los 50 artistas seleccionados y filmar tu canción.",
    features: ["Videoclip", "Equipos cinematográficos", "Filmación en 6k"],
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="py-24 bg-iwon-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Beneficios desde el <span className="text-gold">día 1</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No es solo una suscripción. Es una plataforma de impulso artístico con producciones reales.
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
