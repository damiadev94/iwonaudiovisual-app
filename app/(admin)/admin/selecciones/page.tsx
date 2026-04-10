"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SelectionManager } from "@/components/admin/SelectionManager";
import { toast } from "sonner";
import { Plus, Star } from "lucide-react";
import type { Selection, SelectionApplication, Profile } from "@/types";

interface ApplicationWithProfile extends SelectionApplication {
  profiles: Profile;
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  open: "Abierta",
  reviewing: "En revision",
  announced: "Anunciada",
  in_production: "En produccion",
  completed: "Completada",
};

export default function SeleccionesAdminPage() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [selectedSelection, setSelectedSelection] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSelections();
  }, []);

  async function fetchSelections() {
    const supabase = createClient();
    const { data } = await supabase
      .from("selections")
      .select("*")
      .order("created_at", { ascending: false });
    setSelections((data || []) as Selection[]);
    setLoading(false);
  }

  async function fetchApplications(selectionId: string) {
    setSelectedSelection(selectionId);
    const supabase = createClient();
    const { data } = await supabase
      .from("selection_applications")
      .select("*, profiles(*)")
      .eq("selection_id", selectionId)
      .order("created_at", { ascending: false });
    setApplications((data || []) as ApplicationWithProfile[]);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from("selections").insert({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      max_selected: parseInt(formData.get("max_selected") as string) || 50,
      status: "draft",
    });

    if (error) {
      toast.error("Error al crear la oleada");
    } else {
      toast.success("Oleada creada");
      setDialogOpen(false);
      fetchSelections();
    }
  }

  async function handleUpdateStatus(appId: string, status: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("selection_applications")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", appId);

    if (error) {
      toast.error("Error al actualizar");
    } else {
      toast.success("Estado actualizado");
      if (selectedSelection) fetchApplications(selectedSelection);
    }
  }

  async function handleUpdateSelectionStatus(id: string, status: string) {
    const supabase = createClient();
    const updates: Record<string, string> = { status };
    if (status === "open") {
      updates.open_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from("selections")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar");
    } else {
      toast.success("Estado actualizado");
      fetchSelections();
    }
  }

  if (loading) return <div className="animate-pulse text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Selecciones</h1>
          <p className="text-muted-foreground">Gestion de oleadas &quot;Los 50&quot;.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-gold hover:bg-gold-light text-black font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva oleada
          </DialogTrigger>
          <DialogContent className="bg-iwon-card border-iwon-border">
            <DialogHeader>
              <DialogTitle>Crear nueva oleada</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Titulo</Label>
                <Input name="title" required className="bg-iwon-bg border-iwon-border" placeholder="Ej: Oleada 1 - Abril 2026" />
              </div>
              <div className="space-y-2">
                <Label>Descripcion</Label>
                <Textarea name="description" className="bg-iwon-bg border-iwon-border" />
              </div>
              <div className="space-y-2">
                <Label>Max seleccionados</Label>
                <Input name="max_selected" type="number" defaultValue={50} className="bg-iwon-bg border-iwon-border" />
              </div>
              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-black font-semibold">
                Crear oleada
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selections list */}
        <div className="space-y-3">
          {selections.map((sel) => (
            <Card
              key={sel.id}
              className={`bg-iwon-card border-iwon-border cursor-pointer hover:border-gold/30 transition-all ${selectedSelection === sel.id ? "border-gold" : ""}`}
              onClick={() => fetchApplications(sel.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{sel.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {statusLabels[sel.status]}
                  </Badge>
                </div>
                <div className="flex gap-1 mt-2">
                  {sel.status === "draft" && (
                    <Button size="sm" variant="outline" className="text-xs h-6" onClick={(e) => { e.stopPropagation(); handleUpdateSelectionStatus(sel.id, "open"); }}>
                      Abrir
                    </Button>
                  )}
                  {sel.status === "open" && (
                    <Button size="sm" variant="outline" className="text-xs h-6" onClick={(e) => { e.stopPropagation(); handleUpdateSelectionStatus(sel.id, "reviewing"); }}>
                      Cerrar
                    </Button>
                  )}
                  {sel.status === "reviewing" && (
                    <Button size="sm" variant="outline" className="text-xs h-6" onClick={(e) => { e.stopPropagation(); handleUpdateSelectionStatus(sel.id, "announced"); }}>
                      Anunciar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {selections.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No hay oleadas creadas.</p>
          )}
        </div>

        {/* Applications */}
        <div className="lg:col-span-2">
          {selectedSelection ? (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-gold" />
                Aplicaciones ({applications.length})
              </h2>
              <SelectionManager applications={applications} onUpdateStatus={handleUpdateStatus} />
            </div>
          ) : (
            <Card className="bg-iwon-card border-iwon-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                Selecciona una oleada para ver sus aplicaciones.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
