"use client";

import { Badge } from "@/components/ui/badge";
import type { Subscription } from "@/types";

const statusLabels: Record<string, string> = {
  active: "Activa",
  pending: "Pendiente",
  paused: "Pausada",
  cancelled: "Cancelada",
  expired: "Expirada",
};

const statusColors: Record<string, string> = {
  active: "bg-iwon-success/10 text-iwon-success border-iwon-success/20",
  pending: "bg-iwon-warning/10 text-iwon-warning border-iwon-warning/20",
  paused: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  cancelled: "bg-iwon-error/10 text-iwon-error border-iwon-error/20",
  expired: "bg-muted text-muted-foreground border-iwon-border",
};

export function SubscriptionStatus({ subscription }: { subscription: Subscription | null }) {
  if (!subscription) {
    return (
      <Badge variant="outline" className="bg-iwon-error/10 text-iwon-error border-iwon-error/20">
        Sin suscripción
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={statusColors[subscription.status] || statusColors.pending}>
      {statusLabels[subscription.status] || subscription.status}
    </Badge>
  );
}
