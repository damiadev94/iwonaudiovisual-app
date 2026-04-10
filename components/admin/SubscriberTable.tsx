"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Profile, Subscription } from "@/types";

interface SubscriberWithSub extends Profile {
  subscriptions: Subscription[];
}

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
  cancelled: "bg-iwon-error/10 text-iwon-error border-iwon-error/20",
};

export function SubscriberTable({ subscribers }: { subscribers: SubscriberWithSub[] }) {
  return (
    <div className="rounded-xl border border-iwon-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-iwon-border bg-iwon-bg-secondary">
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Nombre artistico</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No hay suscriptores registrados.
              </TableCell>
            </TableRow>
          ) : (
            subscribers.map((sub) => {
              const latestSub = sub.subscriptions?.[0];
              const status = latestSub?.status || "none";

              return (
                <TableRow key={sub.id} className="border-iwon-border">
                  <TableCell className="font-medium">{sub.full_name || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{sub.email}</TableCell>
                  <TableCell>{sub.artist_name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[status] || "bg-muted text-muted-foreground"}>
                      {statusLabels[status] || "Sin suscripcion"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(sub.created_at).toLocaleDateString("es-AR")}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
