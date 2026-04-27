"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SelectionTimer } from "@/components/platform/SelectionTimer";
import { toast } from "sonner";
import { Trophy, CheckCircle2, Music2, Star } from "lucide-react";
import type { Selection } from "@/types";

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      selection_id: selection.id,
      demo_url: formData.get("demo_url") as string,
      demo_description: formData.get("demo_description") as string,
      tracks_count: parseInt(formData.get("tracks_count") as string) || 1,
    };

    try {
      const res = await fetch("/api/seleccion/aplicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
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
              <p className="text-sm font-semibold text-green-400">¡Ya aplicaste a esta convocatoria!</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Revisá tu correo para novedades.
              </p>
            </div>
          </div>
        ) : (
          <>
            {!showForm ? (
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

                <div className="space-y-2">
                  <Label htmlFor={`demo_url_${selection.id}`}>Link a tu demo *</Label>
                  <Input
                    id={`demo_url_${selection.id}`}
                    name="demo_url"
                    type="url"
                    required
                    placeholder="https://drive.google.com/... o https://soundcloud.com/..."
                    className="bg-iwon-bg border-iwon-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Google Drive, SoundCloud, YouTube u otra plataforma accesible.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`demo_description_${selection.id}`}>
                    Descripción de tu proyecto *
                  </Label>
                  <Textarea
                    id={`demo_description_${selection.id}`}
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
                  <Label htmlFor={`tracks_count_${selection.id}`}>Cantidad de tracks</Label>
                  <Input
                    id={`tracks_count_${selection.id}`}
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
                    onClick={() => setShowForm(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gold hover:bg-gold-light text-black font-semibold"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar aplicación"}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
