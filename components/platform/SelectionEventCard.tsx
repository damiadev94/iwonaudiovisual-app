"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SelectionTimer } from "@/components/platform/SelectionTimer";
import { toast } from "sonner";
import { Trophy, CheckCircle2, Music2, Star, Upload, Music } from "lucide-react";
import type { Selection } from "@/types";

const ACCEPTED_TYPES = ["audio/mpeg", "audio/wav", "audio/wave", "audio/x-wav"];
const MAX_SIZE_BYTES = 50 * 1024 * 1024;

interface SelectionEventCardProps {
  selection: Selection;
  userId: string;
  hasApplied: boolean;
}

export function SelectionEventCard({
  selection,
  userId,
  hasApplied: initialHasApplied,
}: SelectionEventCardProps) {
  const [applied, setApplied] = useState(initialHasApplied);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      toast.error("Seleccioná tu canción antes de enviar");
      return;
    }

    // Leer antes de cualquier await — currentTarget se vuelve null tras el primer yield
    const formData = new FormData(e.currentTarget);
    setLoading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filePath = `${userId}/selections/${selection.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("canciones")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) {
        toast.error("Error al subir el archivo: " + uploadError.message);
        return;
      }
      const res = await fetch("/api/seleccion/aplicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selection_id: selection.id,
          file_path: filePath,
          file_name: file.name,
          demo_description: formData.get("demo_description") as string,
          tracks_count: parseInt(formData.get("tracks_count") as string) || 1,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        // Limpiar el archivo si falla el registro
        await supabase.storage.from("canciones").remove([filePath]);
        toast.error(result.error || "Error al enviar la aplicación");
        return;
      }

      toast.success("¡Aplicación enviada con éxito!");
      setApplied(true);
      setShowForm(false);
    } catch {
      toast.error("Error al enviar la aplicación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-iwon-card border-iwon-border overflow-hidden">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gold/10 rounded-xl border border-gold/20 shrink-0">
              <Music2 className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selection.title}</h2>
              {selection.description && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {selection.description}
                </p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="border-green-500/30 text-green-400 shrink-0">
            Abierta
          </Badge>
        </div>

        {/* Prize */}
        {selection.prize && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gold/5 border border-gold/15">
            <Trophy className="h-5 w-5 text-gold shrink-0" />
            <div>
              <p className="text-xs text-gold/70 uppercase tracking-wider font-semibold">Premio</p>
              <p className="text-sm text-white font-medium">{selection.prize}</p>
            </div>
          </div>
        )}

        {/* Countdown */}
        {selection.close_date && <SelectionTimer closeDate={selection.close_date} />}

        {/* Applied state */}
        {applied ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-400">
                ¡Ya aplicaste a esta convocatoria!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Revisá tu correo para novedades.
              </p>
            </div>
          </div>
        ) : !showForm ? (
          <Button
            className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
            onClick={() => setShowForm(true)}
          >
            <Star className="h-4 w-4 mr-2" />
            Participar en esta convocatoria
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-iwon-border">
            <p className="text-sm font-semibold text-white">Enviá tu canción</p>

            {/* File upload zone */}
            <div
              className="border-2 border-dashed border-iwon-border rounded-lg p-8 text-center cursor-pointer hover:border-gold/40 transition-colors"
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
                <div className="space-y-1">
                  <Music className="h-8 w-8 text-gold mx-auto" />
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB · Hacé clic para cambiar
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="font-medium text-sm">Seleccioná tu canción</p>
                  <p className="text-xs text-muted-foreground">MP3 o WAV · Máximo 50MB</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`desc_${selection.id}`}>Descripción de tu proyecto *</Label>
              <Textarea
                id={`desc_${selection.id}`}
                name="demo_description"
                required
                minLength={10}
                maxLength={500}
                rows={3}
                placeholder="Contá sobre tu estilo, tu propuesta artística..."
                className="bg-iwon-bg border-iwon-border resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`tracks_${selection.id}`}>Cantidad de tracks</Label>
              <Input
                id={`tracks_${selection.id}`}
                name="tracks_count"
                type="number"
                min={1}
                max={20}
                defaultValue={1}
                className="bg-iwon-bg border-iwon-border"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-iwon-border"
                onClick={() => { setShowForm(false); setFile(null); }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gold hover:bg-gold-light text-black font-semibold"
                disabled={loading || !file}
              >
                {loading ? "Subiendo..." : "Enviar canción"}
              </Button>
        </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
