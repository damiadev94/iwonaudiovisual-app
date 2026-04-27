"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SelectionManager } from "@/components/admin/SelectionManager";
import { toast } from "sonner";
import { Plus, Star, Pencil, Trash2 } from "lucide-react";
import type { Selection, SelectionApplication, Profile } from "@/types";

interface ApplicationWithProfile extends SelectionApplication {
  profiles: Profile;
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  open: "Abierta",
  reviewing: "En revisión",
  announced: "Anunciada",
  in_production: "En producción",
  completed: "Completada",
};

function SelectionForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<Selection>;
  onSubmit: (data: FormData) => void;
  loading: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>Nombre *</Label>
        <Input
          name="title"
          required
          defaultValue={defaultValues?.title ?? ""}
          className="bg-iwon-bg border-iwon-border"
          placeholder="Ej: Oleada 1 - Abril 2026"
        />
      </div>
      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          className="bg-iwon-bg border-iwon-border"
          placeholder="Describí la convocatoria..."
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Premio</Label>
        <Input
          name="prize"
          defaultValue={defaultValues?.prize ?? ""}
          className="bg-iwon-bg border-iwon-border"
          placeholder="Ej: Producción profesional + videoclip"
        />
      </div>
      <div className="space-y-2">
        <Label>Fecha límite</Label>
        <Input
          name="close_date"
          type="datetime-local"
          defaultValue={
            defaultValues?.close_date
              ? new Date(defaultValues.close_date).toISOString().slice(0, 16)
              : ""
          }
          className="bg-iwon-bg border-iwon-border"
        />
      </div>
      <div className="space-y-2">
        <Label>Máx. seleccionados</Label>
        <Input
          name="max_selected"
          type="number"
          defaultValue={defaultValues?.max_selected ?? 50}
          className="bg-iwon-bg border-iwon-border"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}

export default function SeleccionesAdminPage() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Selection | null>(null);

  const fetchSelections = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("selections")
      .select("*")
      .order("created_at", { ascending: false });
    setSelections((data || []) as Selection[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSelections();
  }, [fetchSelections]);

  async function fetchApplications(selectionId: string) {
    setSelectedId(selectionId);
    const supabase = createClient();
    const { data } = await supabase
      .from("selection_applications")
      .select("*, profiles(*)")
      .eq("selection_id", selectionId)
      .order("created_at", { ascending: false });
    setApplications((data || []) as ApplicationWithProfile[]);
  }

  async function handleCreate(formData: FormData) {
    setFormLoading(true);
    const supabase = createClient();
    const closeDateRaw = formData.get("close_date") as string;

    const { error } = await supabase.from("selections").insert({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      prize: (formData.get("prize") as string) || null,
      close_date: closeDateRaw ? new Date(closeDateRaw).toISOString() : null,
      max_selected: parseInt(formData.get("max_selected") as string) || 50,
      status: "draft",
    });

    setFormLoading(false);
    if (error) {
      toast.error("Error al crear la selección");
    } else {
      toast.success("Selección creada");
      setCreateOpen(false);
      fetchSelections();
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editTarget) return;
    setFormLoading(true);
    const supabase = createClient();
    const closeDateRaw = formData.get("close_date") as string;

    const { error } = await supabase
      .from("selections")
      .update({
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || null,
        prize: (formData.get("prize") as string) || null,
        close_date: closeDateRaw ? new Date(closeDateRaw).toISOString() : null,
        max_selected: parseInt(formData.get("max_selected") as string) || 50,
      })
      .eq("id", editTarget.id);

    setFormLoading(false);
    if (error) {
      toast.error("Error al actualizar la selección");
    } else {
      toast.success("Selección actualizada");
      setEditTarget(null);
      fetchSelections();
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("selections").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar la selección");
    } else {
      toast.success("Selección eliminada");
      if (selectedId === id) {
        setSelectedId(null);
        setApplications([]);
      }
      fetchSelections();
    }
  }

  async function handleUpdateSelectionStatus(id: string, status: string) {
    const supabase = createClient();
    const updates: Record<string, string> = { status };
    if (status === "open") updates.open_date = new Date().toISOString();

    const { error } = await supabase.from("selections").update(updates).eq("id", id);
    if (error) {
      toast.error("Error al actualizar estado");
    } else {
      toast.success("Estado actualizado");
      fetchSelections();
    }
  }

  async function handleUpdateAppStatus(appId: string, status: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("selection_applications")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", appId);

    if (error) {
      toast.error("Error al actualizar");
    } else {
      toast.success("Estado actualizado");
      if (selectedId) fetchApplications(selectedId);
    }
  }

  if (loading) return <div className="animate-pulse text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Selección de Artistas</h1>
          <p className="text-muted-foreground">Gestión de convocatorias de selección.</p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button className="bg-gold hover:bg-gold-light text-black font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva convocatoria
          </DialogTrigger>
          <DialogContent className="bg-iwon-card border-iwon-border">
            <DialogHeader>
              <DialogTitle>Crear convocatoria</DialogTitle>
            </DialogHeader>
            <SelectionForm onSubmit={handleCreate} loading={formLoading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="bg-iwon-card border-iwon-border">
          <DialogHeader>
            <DialogTitle>Editar convocatoria</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <SelectionForm
              defaultValues={editTarget}
              onSubmit={handleUpdate}
              loading={formLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selections list */}
        <div className="space-y-3">
          {selections.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay convocatorias creadas.
            </p>
          )}
          {selections.map((sel) => (
            <Card
              key={sel.id}
              className={`bg-iwon-card border-iwon-border cursor-pointer hover:border-gold/30 transition-all ${
                selectedId === sel.id ? "border-gold" : ""
              }`}
              onClick={() => fetchApplications(sel.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-1 gap-2">
                  <h3 className="font-medium text-sm leading-tight">{sel.title}</h3>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {statusLabels[sel.status]}
                  </Badge>
                </div>

                {sel.prize && (
                  <p className="text-xs text-gold mb-1 truncate">🏆 {sel.prize}</p>
                )}
                {sel.close_date && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Cierra: {new Date(sel.close_date).toLocaleDateString("es-AR")}
                  </p>
                )}

                <div className="flex gap-1 flex-wrap mt-2">
                  {sel.status === "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateSelectionStatus(sel.id, "open");
                      }}
                    >
                      Abrir
                    </Button>
                  )}
                  {sel.status === "open" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateSelectionStatus(sel.id, "reviewing");
                      }}
                    >
                      Cerrar
                    </Button>
                  )}
                  {sel.status === "reviewing" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateSelectionStatus(sel.id, "announced");
                      }}
                    >
                      Anunciar
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-6 ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTarget(sel);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-6 border-iwon-error/30 text-iwon-error hover:bg-iwon-error/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("¿Eliminar esta convocatoria? Se borrarán todas sus aplicaciones.")) {
                        handleDelete(sel.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Applications */}
        <div className="lg:col-span-2">
          {selectedId ? (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-gold" />
                Aplicaciones ({applications.length})
              </h2>
              <SelectionManager
                applications={applications}
                onUpdateStatus={handleUpdateAppStatus}
              />
            </div>
          ) : (
            <Card className="bg-iwon-card border-iwon-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                Seleccioná una convocatoria para ver sus aplicaciones.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
