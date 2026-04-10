"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Music, CheckCircle, FileAudio } from "lucide-react";
import type { SongSubmission } from "@/types";

const ACCEPTED_TYPES = ["audio/mpeg", "audio/wav", "audio/wave", "audio/x-wav"];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pendiente de revision",
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
    label: "No seleccionado",
    className: "bg-iwon-error/10 text-iwon-error border-iwon-error/20",
  },
};

export function CancionUploadForm({
  userId,
  existingSubmission,
}: {
  userId: string;
  existingSubmission: SongSubmission | null;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submission, setSubmission] = useState<SongSubmission | null>(
    existingSubmission
  );
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast.error("Solo se aceptan archivos MP3 o WAV");
      return;
    }

    if (selected.size > MAX_SIZE_BYTES) {
      toast.error("El archivo no puede superar los 50MB");
      return;
    }

    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${ext}`;

      // Subir directamente a Supabase Storage desde el browser
      const { error: uploadError } = await supabase.storage
        .from("canciones")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) {
        toast.error("Error al subir el archivo. Intenta de nuevo.");
        return;
      }

      // Registrar metadatos en la base de datos
      const res = await fetch("/api/canciones/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        // Limpiar el archivo si falla el registro en DB
        await supabase.storage.from("canciones").remove([filePath]);
        const err = await res.json();
        toast.error(err.error || "Error al registrar la cancion");
        return;
      }

      const { data } = await res.json();
      setSubmission(data as SongSubmission);
      toast.success("Cancion enviada con exito");
    } catch {
      toast.error("Error inesperado. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  // Vista de submission existente
  if (submission) {
    const statusInfo = statusConfig[submission.status] ?? statusConfig.pending;
    return (
      <Card className="bg-iwon-card border-iwon-border">
        <CardContent className="py-8 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-iwon-success shrink-0" />
            <div>
              <h2 className="font-semibold">Cancion enviada</h2>
              <p className="text-sm text-muted-foreground">
                Nuestro equipo la revisara y te notificaremos el resultado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-iwon-bg rounded-lg border border-iwon-border">
            <FileAudio className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{submission.file_name}</p>
              {submission.file_size && (
                <p className="text-xs text-muted-foreground">
                  {(submission.file_size / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 ${statusInfo.className}`}
            >
              {statusInfo.label}
            </Badge>
          </div>

          {submission.notes && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Tu mensaje
              </p>
              <p className="text-sm">{submission.notes}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Enviada el{" "}
            {new Date(submission.created_at).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Formulario de upload
  return (
    <Card className="bg-iwon-card border-iwon-border">
      <CardContent className="py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Zona de seleccion de archivo */}
          <div
            className="border-2 border-dashed border-iwon-border rounded-lg p-10 text-center cursor-pointer hover:border-gold/40 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".mp3,.wav"
              className="hidden"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="space-y-2">
                <Music className="h-10 w-10 text-gold mx-auto" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
                <p className="text-xs text-muted-foreground">
                  Click para cambiar el archivo
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-medium">Selecciona tu cancion</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    MP3 o WAV · Maximo 50MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notas opcionales */}
          <div className="space-y-2">
            <Label htmlFor="notes">Mensaje para el equipo (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contanos sobre tu cancion, el genero, tus referencias..."
              className="bg-iwon-bg border-iwon-border resize-none"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
          >
            {uploading ? "Subiendo..." : "Enviar cancion"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
