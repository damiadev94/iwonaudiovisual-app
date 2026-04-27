"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { Download, ExternalLink, FileAudio } from "lucide-react";
import { toast } from "sonner";

interface ApplicationWithProfile extends SelectionApplication {
  profiles: Profile;
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  reviewing: "En revisión",
  selected: "Seleccionado",
  rejected: "Rechazado",
};

const statusColors: Record<string, string> = {
  pending: "bg-iwon-warning/10 text-iwon-warning border-iwon-warning/20",
  reviewing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  selected: "bg-iwon-success/10 text-iwon-success border-iwon-success/20",
  rejected: "bg-iwon-error/10 text-iwon-error border-iwon-error/20",
};

function DownloadButton({ filePath, fileName }: { filePath: string; fileName: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("canciones")
        .createSignedUrl(filePath, 60);

      if (error || !data) {
        toast.error("No se pudo generar el enlace de descarga");
        return;
      }

      window.open(data.signedUrl, "_blank");
    } catch {
      toast.error("Error al descargar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 text-gold hover:text-gold-light text-sm disabled:opacity-50"
    >
      <FileAudio className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate max-w-30">{fileName}</span>
      <Download className="h-3 w-3 shrink-0" />
    </button>
  );
}

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
            <TableHead>Canción</TableHead>
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
                    <p className="font-medium">
                      {app.profiles?.artist_name || app.profiles?.full_name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">{app.profiles?.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {app.file_path && app.file_name ? (
                    <DownloadButton filePath={app.file_path} fileName={app.file_name} />
                  ) : app.demo_url ? (
                    <a
                      href={app.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gold hover:text-gold-light text-sm"
                    >
                      Ver demo <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
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
