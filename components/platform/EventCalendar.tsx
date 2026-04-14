import { Calendar, Users, Gift, Film, BookOpen } from "lucide-react";

const events = [
  {
    icon: Users,
    title: "Selección - Los 50",
    description: "Convocatoria abierta para la próxima oleada",
    color: "text-gold",
  },
  {
    icon: Gift,
    title: "Sorteos mensuales",
    description: "Participá por premios exclusivos",
    color: "text-iwon-success",
  },
  {
    icon: Film,
    title: "Promos de filmación",
    description: "Reservá tu sesión a precio reducido",
    color: "text-blue-400",
  },
  {
    icon: BookOpen,
    title: "Nuevos cursos",
    description: "Contenido actualizado regularmente",
    color: "text-purple-400",
  },
];

export function EventCalendar() {
  return (
    <div className="rounded-xl bg-iwon-card border border-iwon-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-gold" />
        <h3 className="font-semibold">Calendario de eventos</h3>
      </div>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.title}
            className="flex items-start gap-3 p-3 rounded-lg bg-iwon-bg hover:bg-iwon-bg-secondary transition-colors"
          >
            <event.icon className={`h-5 w-5 ${event.color} shrink-0 mt-0.5`} />
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
