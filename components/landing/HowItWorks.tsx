import { Users, Gift, Film, BookOpen } from "lucide-react";

const steps = [
  {
    icon: Users,
    title: "Seleccion",
    subtitle: "Los 50",
    description:
      "Seleccionamos a los 50 mejores artistas de la comunidad para filmarles su disco completo con equipamiento de cine.",
    color: "text-gold",
  },
  {
    icon: Gift,
    title: "Sorteos",
    subtitle: "Premios exclusivos",
    description:
      "Sorteos mensuales de sesiones de grabacion, videoclips y mas. Solo para suscriptores activos.",
    color: "text-iwon-success",
  },
  {
    icon: Film,
    title: "Promos",
    subtitle: "Filmacion accesible",
    description:
      "Accede a promos exclusivas de filmacion a precios reducidos. Cupos limitados a 200 artistas.",
    color: "text-blue-400",
  },
  {
    icon: BookOpen,
    title: "Cursos",
    subtitle: "Formacion continua",
    description:
      "Cursos de finanzas, marketing, branding y distribucion para que tu carrera musical despegue.",
    color: "text-purple-400",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-iwon-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Como funciona
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Un ciclo de eventos rotativo que te da oportunidades reales de crecimiento como artista.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative p-6 rounded-xl bg-iwon-card border border-iwon-border hover:border-gold/30 transition-all duration-300 group"
            >
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gold text-black flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>

              <step.icon className={`h-10 w-10 ${step.color} mb-4`} />
              <h3 className="text-lg font-bold mb-1">{step.title}</h3>
              <p className="text-sm text-gold mb-3">{step.subtitle}</p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Arrow connector for desktop */}
        <div className="hidden lg:flex justify-center mt-8">
          <div className="flex items-center gap-2 text-gold/40">
            <span className="text-sm">Ciclo rotativo continuo</span>
            <svg width="40" height="20" viewBox="0 0 40 20" fill="currentColor">
              <path d="M0 10 Q10 0, 20 10 Q30 20, 40 10" stroke="currentColor" fill="none" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
