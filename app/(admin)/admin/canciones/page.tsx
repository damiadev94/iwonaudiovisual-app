"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Music, FileAudio, Pin } from "lucide-react";
import type { SongSubmission, Profile } from "@/types";

interface SubmissionWithProfile extends SongSubmission {
  profiles: Pick<Profile, "artist_name" | "email" | "full_name">;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pendiente",
    className: "bg-iwon-warning/10 text-iwon-warning border-iwon-warning/20",
  },
  reviewing: {
    label: "En revisión",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  selected: {
    label: "Seleccionado",
    className: "bg-iwon-success/10 text-iwon-success border-iwon-success/20",
  },
  rejected: {
    label: "Rechazado",
    className: "bg-iwon-error/10 text-iwon-error border-iwon-error/20",
  },
};

function sortSubmissions(items: SubmissionWithProfile[]): SubmissionWithProfile[] {
  return [...items].sort((a, b) => {
    if (a.status === "selected" && b.status !== "selected") return -1;
    if (a.status !== "selected" && b.status === "selected") return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export default function CancionesAdminPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/canciones");
    if (res.ok) {
      const { data } = await res.json();
      setSubmissions(sortSubmissions(data as SubmissionWithProfile[]));
    } else {
      toast.error("Error al cargar las canciones");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  function handleDownload(id: string) {
    window.open(`/api/admin/canciones/${id}/download`, "_blank");
  }

  async function handleUpdateStatus(id: string, status: string) {
    setUpdatingId(id);
    const res = await fetch("/api/admin/canciones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) {
      toast.error("Error al actualizar el estado");
    } else {
      toast.success(status === "selected" ? "Canción fijada como seleccionada" : "Estado actualizado");
      await fetchSubmissions();
    }
    setUpdatingId(null);
  }

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Cargando...</div>;
  }

  const selected = submissions.filter((s) => s.status === "selected");
  const rest = submissions.filter((s) => s.status !== "selected");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Canciones</h1>
        <p className="text-muted-foreground">
          Demos enviados por los suscriptores para evaluación.
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card className="bg-iwon-card border-iwon-border">
          <CardContent className="py-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay canciones enviadas todavía.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Seleccionadas / fijadas arriba */}
          {selected.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-iwon-success uppercase tracking-wider">
                <Pin className="h-4 w-4" />
                Seleccionadas ({selected.length})
              </div>
              <div className="space-y-3">
                {selected.map((sub) => (
                  <SubmissionCard
                    key={sub.id}
                    sub={sub}
                    updatingId={updatingId}
                    onDownload={handleDownload}
                    onUpdateStatus={handleUpdateStatus}
                    pinned
                  />
                ))}
              </div>
            </div>
          )}

          {/* Resto */}
          {rest.length > 0 && (
            <div className="space-y-2">
              {selected.length > 0 && (
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Pendientes / En revisión ({rest.length})
                </p>
              )}
              <div className="space-y-3">
                {rest.map((sub) => (
                  <SubmissionCard
                    key={sub.id}
                    sub={sub}
                    updatingId={updatingId}
                    onDownload={handleDownload}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({
  sub,
  updatingId,
  onDownload,
  onUpdateStatus,
  pinned = false,
}: {
  sub: SubmissionWithProfile;
  updatingId: string | null;
  onDownload: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  pinned?: boolean;
}) {
  const statusInfo = statusConfig[sub.status] ?? statusConfig.pending;
  const artistName =
    sub.profiles?.artist_name ||
    sub.profiles?.full_name ||
    sub.profiles?.email ||
    "Sin nombre";

  return (
    <Card
      className={`bg-iwon-card border-iwon-border ${
        pinned ? "border-iwon-success/30 bg-iwon-success/5" : ""
      }`}
    >
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <FileAudio className="h-8 w-8 text-muted-foreground mt-0.5" />
            {pinned && (
              <Pin className="h-3.5 w-3.5 text-iwon-success absolute -top-1 -right-1" fill="currentColor" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-lg">{sub.song_title || "Sin título"}</span>
              <Badge variant="outline" className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                {sub.genre || "Sin género"}
              </Badge>
              <span className="text-sm text-muted-foreground">por {artistName}</span>
            </div>
            <p className="text-sm text-muted-foreground truncate mt-0.5">{sub.file_name}</p>
            {sub.file_size && (
              <p className="text-xs text-muted-foreground">
                {(sub.file_size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
            {sub.notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                &ldquo;{sub.notes}&rdquo;
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(sub.created_at).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="border-iwon-border"
              onClick={() => onDownload(sub.id)}
            >
              <Download className="h-4 w-4 mr-1" />
              Descargar
            </Button>

            <div className="flex gap-1">
              {sub.status !== "reviewing" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 flex-1"
                  disabled={updatingId === sub.id}
                  onClick={() => onUpdateStatus(sub.id, "reviewing")}
                >
                  Revisar
                </Button>
              )}
              {sub.status !== "selected" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 flex-1 text-iwon-success border-iwon-success/30 hover:bg-iwon-success/10"
                  disabled={updatingId === sub.id}
                  onClick={() => onUpdateStatus(sub.id, "selected")}
                >
                  <Pin className="h-3 w-3 mr-1" />
                  Fijar
                </Button>
              )}
              {sub.status !== "rejected" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 flex-1 text-iwon-error border-iwon-error/30 hover:bg-iwon-error/10"
                  disabled={updatingId === sub.id}
                  onClick={() => onUpdateStatus(sub.id, "rejected")}
                >
                  Rechazar
                </Button>
              )}
              {sub.status === "selected" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 flex-1 text-muted-foreground"
                  disabled={updatingId === sub.id}
                  onClick={() => onUpdateStatus(sub.id, "pending")}
                >
                  Desfijar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
