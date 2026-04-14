"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Music, FileAudio } from "lucide-react";
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
    label: "En revision",
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

export default function CancionesAdminPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    const supabase = createClient();
    const { data } = await supabase
      .from("song_submissions")
      .select("*, profiles(artist_name, email, full_name)")
      .order("created_at", { ascending: false });
    setSubmissions((data || []) as SubmissionWithProfile[]);
    setLoading(false);
  }

  function handleDownload(id: string) {
    window.open(`/api/admin/canciones/${id}/download`, "_blank");
  }

  async function handleUpdateStatus(id: string, status: string) {
    setUpdatingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("song_submissions")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar el estado");
    } else {
      toast.success("Estado actualizado");
      fetchSubmissions();
    }
    setUpdatingId(null);
  }

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Canciones</h1>
        <p className="text-muted-foreground">
          Demos enviados por los suscriptores para evaluacion.
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card className="bg-iwon-card border-iwon-border">
          <CardContent className="py-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay canciones enviadas todavia.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const statusInfo =
              statusConfig[sub.status] ?? statusConfig.pending;
            const artistName =
              sub.profiles?.artist_name ||
              sub.profiles?.full_name ||
              sub.profiles?.email ||
              "Sin nombre";

            return (
              <Card key={sub.id} className="bg-iwon-card border-iwon-border">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <FileAudio className="h-8 w-8 text-muted-foreground shrink-0 mt-0.5" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-lg">{sub.song_title || "Sin título"}</span>
                        <Badge
                          variant="outline"
                          className={statusInfo.className}
                        >
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                          {sub.genre || "Sin género"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">por {artistName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {sub.file_name}
                      </p>
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
                        onClick={() => handleDownload(sub.id)}
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
                            onClick={() =>
                              handleUpdateStatus(sub.id, "reviewing")
                            }
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
                            onClick={() =>
                              handleUpdateStatus(sub.id, "selected")
                            }
                          >
                            Seleccionar
                          </Button>
                        )}
                        {sub.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 flex-1 text-iwon-error border-iwon-error/30 hover:bg-iwon-error/10"
                            disabled={updatingId === sub.id}
                            onClick={() =>
                              handleUpdateStatus(sub.id, "rejected")
                            }
                          >
                            Rechazar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
