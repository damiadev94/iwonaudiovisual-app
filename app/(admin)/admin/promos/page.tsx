"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Film, Users } from "lucide-react";
import type { Promo } from "@/types";

export default function PromosAdminPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPromos = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("promos")
      .select("*")
      .order("created_at", { ascending: false });
    setPromos((data || []) as Promo[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from("promos").insert({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string) || 49999,
      max_slots: parseInt(formData.get("max_slots") as string) || 200,
      status: "draft",
    });

    if (error) {
      toast.error("Error al crear la promo");
    } else {
      toast.success("Promo creada");
      setDialogOpen(false);
      fetchPromos();
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("promos")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar");
    } else {
      toast.success("Estado actualizado");
      fetchPromos();
    }
  }

  if (loading) return <div className="animate-pulse text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promos</h1>
          <p className="text-muted-foreground">Gestión de promos de filmación.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-gold hover:bg-gold-light text-black font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva promo
          </DialogTrigger>
          <DialogContent className="bg-iwon-card border-iwon-border">
            <DialogHeader>
              <DialogTitle>Crear nueva promo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="title" required className="bg-iwon-bg border-iwon-border" />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea name="description" className="bg-iwon-bg border-iwon-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio (ARS)</Label>
                  <Input name="price" type="number" defaultValue={49999} className="bg-iwon-bg border-iwon-border" />
                </div>
                <div className="space-y-2">
                  <Label>Cupos</Label>
                  <Input name="max_slots" type="number" defaultValue={200} className="bg-iwon-bg border-iwon-border" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-black font-semibold">
                Crear promo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((promo) => (
          <Card key={promo.id} className="bg-iwon-card border-iwon-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Film className="h-4 w-4 text-blue-400" />
                  {promo.title}
                </CardTitle>
                <Badge variant="outline" className="text-xs">{promo.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Precio</span>
                <span className="font-mono font-bold text-gold">${promo.price.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> Cupos
                </span>
                <span>{promo.slots_taken}/{promo.max_slots}</span>
              </div>

              <div className="w-full bg-iwon-bg rounded-full h-1.5">
                <div
                  className="bg-gold rounded-full h-1.5"
                  style={{ width: `${(promo.slots_taken / promo.max_slots) * 100}%` }}
                />
              </div>

              <div className="flex gap-1 flex-wrap">
                {promo.status === "draft" && (
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleUpdateStatus(promo.id, "active")}>
                    Activar
                  </Button>
                )}
                {promo.status === "active" && (
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleUpdateStatus(promo.id, "sold_out")}>
                    Marcar agotado
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {promos.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">No hay promos creadas.</p>
        )}
      </div>
    </div>
  );
}
