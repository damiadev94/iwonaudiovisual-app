"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SelectionApplication, Profile } from "@/types";
import { ExternalLink } from "lucide-react";

interface ApplicationWithProfile extends SelectionApplication {
  profiles: Profile;
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  reviewing: "En revision",
  selected: "Seleccionado",
  rejected: "Rechazado",
};

const statusColors: Record<string, string> = {
  pending: "bg-iwon-warning/10 text-iwon-warning border-iwon-warning/20",
  reviewing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  selected: "bg-iwon-success/10 text-iwon-success border-iwon-success/20",
  rejected: "bg-iwon-error/10 text-iwon-error border-iwon-error/20",
};

export function SelectionManager({
  applications,
  onUpdateStatus,
}: {
  applications: ApplicationWithProfile[];
  onUpdateStatus: (id: string, status: string) => void;
}) {
  return (
    <div className="rounded-xl border border-iwon-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-iwon-border bg-iwon-bg-secondary">
            <TableHead>Artista</TableHead>
            <TableHead>Demo</TableHead>
            <TableHead>Tracks</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No hay aplicaciones.
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => (
              <TableRow key={app.id} className="border-iwon-border">
                <TableCell>
                  <div>
                    <p className="font-medium">{app.profiles?.artist_name || app.profiles?.full_name || "-"}</p>
                    <p className="text-xs text-muted-foreground">{app.profiles?.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={app.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gold hover:text-gold-light text-sm"
                  >
                    Ver demo <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>{app.tracks_count}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[app.status]}>
                    {statusLabels[app.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 border-iwon-success/30 text-iwon-success hover:bg-iwon-success/10"
                      onClick={() => onUpdateStatus(app.id, "selected")}
                    >
                      Seleccionar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 border-iwon-error/30 text-iwon-error hover:bg-iwon-error/10"
                      onClick={() => onUpdateStatus(app.id, "rejected")}
                    >
                      Rechazar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
