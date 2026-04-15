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
import { toast } from "sonner";
import { Plus, Gift, Trophy, Users, Shuffle, Edit, Trash2, Calendar } from "lucide-react";
import type { Raffle } from "@/types";

export default function SorteosAdminPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editRaffle, setEditRaffle] = useState<Raffle | null>(null);

  useEffect(() => {
    fetchRaffles();
  }, []);

  async function fetchRaffles() {
    const supabase = createClient();
    const { data } = await supabase
      .from("raffles")
      .select("*")
      .order("created_at", { ascending: false });
    setRaffles((data || []) as Raffle[]);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from("raffles").insert({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      prize_description: formData.get("prize_description") as string,
      draw_date: formData.get("draw_date") as string || null,
      status: "draft",
    });

    if (error) {
      toast.error("Error al crear el sorteo");
    } else {
      toast.success("Sorteo creado");
      setCreateDialogOpen(false);
      fetchRaffles();
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editRaffle) return;
    
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase
      .from("raffles")
      .update({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        prize_description: formData.get("prize_description") as string,
        draw_date: formData.get("draw_date") as string || null,
      })
      .eq("id", editRaffle.id);

    if (error) {
      toast.error("Error al actualizar el sorteo");
    } else {
      toast.success("Sorteo actualizado");
      setEditRaffle(null);
      fetchRaffles();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este sorteo?")) return;
    
    const supabase = createClient();
    const { error } = await supabase.from("raffles").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar");
    } else {
      toast.success("Sorteo eliminado");
      fetchRaffles();
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("raffles")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar");
    } else {
      toast.success("Estado actualizado");
      fetchRaffles();
    }
  }

  async function handlePickWinner(raffleId: string) {
    const supabase = createClient();

    const { data: entries } = await supabase
      .from("raffle_entries")
      .select("user_id")
      .eq("raffle_id", raffleId);

    if (!entries || entries.length === 0) {
      toast.error("No hay participantes");
      return;
    }

    const randomIndex = Math.floor(Math.random() * entries.length);
    const winnerId = entries[randomIndex].user_id;

    const { error } = await supabase
      .from("raffles")
      .update({ winner_id: winnerId, status: "completed" })
      .eq("id", raffleId);

    if (error) {
      toast.error("Error al seleccionar ganador");
    } else {
      toast.success("Ganador seleccionado!");
      fetchRaffles();
    }
  }

  if (loading) return <div className="animate-pulse text-muted-foreground p-8">Cargando sorteos...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Sorteos</h1>
          <p className="text-muted-foreground">Administrá los sorteos y premios de la plataforma.</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger render={<Button className="bg-gold hover:bg-gold-light text-black font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo sorteo
          </DialogTrigger>
          <DialogContent className="bg-iwon-card border-iwon-border">
            <DialogHeader>
              <DialogTitle>Crear nuevo sorteo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nombre del sorteo</Label>
                <Input name="title" required className="bg-iwon-bg border-iwon-border" placeholder="Ej: Sorteo de Fin de Año" />
              </div>
              <div className="space-y-2">
                <Label>Fecha del sorteo</Label>
                <Input name="draw_date" type="date" required className="bg-iwon-bg border-iwon-border" />
              </div>
              <div className="space-y-2">
                <Label>Premio</Label>
                <Input name="prize_description" required className="bg-iwon-bg border-iwon-border" placeholder="Ej: Una sesión de grabación Iwon" />
              </div>
              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Textarea name="description" className="bg-iwon-bg border-iwon-border" rows={3} />
              </div>
              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-black font-semibold">
                Crear Sorteo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {raffles.map((raffle) => (
          <Card key={raffle.id} className="bg-iwon-card border-iwon-border flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg flex items-center gap-2 truncate">
                  <Gift className="h-5 w-5 text-iwon-success shrink-0" />
                  {raffle.title}
                </CardTitle>
                <Badge variant="outline" className={`text-[10px] uppercase shrink-0 ${
                  raffle.status === 'active' ? 'border-iwon-success text-iwon-success' : ''
                }`}>
                  {raffle.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-2 flex-1">
                <div className="flex items-start gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Premio</span>
                    <span className="font-medium text-white">{raffle.prize_description}</span>
                  </div>
                </div>

                {raffle.draw_date && (
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Fecha</span>
                      <span className="font-medium text-white">
                        {new Date(raffle.draw_date).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-iwon-border space-y-2">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs h-8 border-white/10"
                    onClick={() => setEditRaffle(raffle)}
                  >
                    <Edit className="h-3 w-3 mr-1.5" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-8 border-iwon-error/20 text-iwon-error hover:bg-iwon-error/10"
                    onClick={() => handleDelete(raffle.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  {raffle.status === "draft" && (
                    <Button 
                      className="flex-1 bg-iwon-success/20 text-iwon-success hover:bg-iwon-success/30 text-xs h-8"
                      onClick={() => handleUpdateStatus(raffle.id, "active")}
                    >
                      Activar Sorteo
                    </Button>
                  )}
                  {raffle.status === "active" && (
                    <>
                      <Button 
                        className="flex-1 bg-gold hover:bg-gold-light text-black font-bold text-xs h-8"
                        onClick={() => handlePickWinner(raffle.id)}
                      >
                        <Shuffle className="h-3 w-3 mr-1.5" />
                        Sortear Ganador
                      </Button>
                      <Button 
                        variant="outline"
                        className="text-xs h-8 border-white/10 text-muted-foreground"
                        onClick={() => handleUpdateStatus(raffle.id, "cancelled")}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>

                {raffle.winner_id && (
                  <div className="p-2 bg-iwon-success/10 rounded-lg text-xs text-iwon-success flex items-center justify-center gap-2 font-bold animate-in zoom-in duration-300">
                    <Users className="h-4 w-4" />
                    ¡Ganador seleccionado!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editRaffle} onOpenChange={(open) => !open && setEditRaffle(null)}>
        <DialogContent className="bg-iwon-card border-iwon-border">
          <DialogHeader>
            <DialogTitle>Editar sorteo</DialogTitle>
          </DialogHeader>
          {editRaffle && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nombre del sorteo</Label>
                <Input name="title" defaultValue={editRaffle.title} required className="bg-iwon-bg border-iwon-border" />
              </div>
              <div className="space-y-2">
                <Label>Fecha del sorteo</Label>
                <Input 
                  name="draw_date" 
                  type="date" 
                  defaultValue={editRaffle.draw_date ? new Date(editRaffle.draw_date).toISOString().split('T')[0] : ''} 
                  required 
                  className="bg-iwon-bg border-iwon-border" 
                />
              </div>
              <div className="space-y-2">
                <Label>Premio</Label>
                <Input name="prize_description" defaultValue={editRaffle.prize_description} required className="bg-iwon-bg border-iwon-border" />
              </div>
              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Textarea name="description" defaultValue={editRaffle.description || ''} className="bg-iwon-bg border-iwon-border" rows={3} />
              </div>
              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-black font-semibold">
                Guardar cambios
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
