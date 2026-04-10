import { Card, CardContent } from "@/components/ui/card";
import { Users, CreditCard, Star, Film } from "lucide-react";

interface StatsCardsProps {
  activeSubscribers: number;
  monthlyRevenue: number;
  activeSelections: number;
  totalClips: number;
}

export function StatsCards({
  activeSubscribers,
  monthlyRevenue,
  activeSelections,
  totalClips,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Suscriptores activos",
      value: activeSubscribers,
      icon: Users,
      color: "text-gold",
      format: (v: number) => v.toString(),
    },
    {
      label: "Revenue mensual",
      value: monthlyRevenue,
      icon: CreditCard,
      color: "text-iwon-success",
      format: (v: number) => `$${v.toLocaleString("es-AR")}`,
    },
    {
      label: "Selecciones activas",
      value: activeSelections,
      icon: Star,
      color: "text-blue-400",
      format: (v: number) => v.toString(),
    },
    {
      label: "Clips producidos",
      value: totalClips,
      icon: Film,
      color: "text-purple-400",
      format: (v: number) => `+${v}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-iwon-card border-iwon-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold font-mono">{stat.format(stat.value)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
