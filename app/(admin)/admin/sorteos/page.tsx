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
import { Plus, Gift, Trophy, Users, Shuffle } from "lucide-react";
import type { Raffle } from "@/types";

export default function SorteosAdminPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      status: "draft",
    });

    if (error) {
      toast.error("Error al crear el sorteo");
    } else {
      toast.success("Sorteo creado");
      setDialogOpen(false);
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

  if (loading) return <div className="animate-pulse text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sorteos</h1>
          <p className="text-muted-foreground">Creá y gestioná sorteos para suscriptores.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-gold hover:bg-gold-light text-black font-semibold" />}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo sorteo
          </DialogTrigger>
          <DialogContent className="bg-iwon-card border-iwon-border">
            <DialogHeader>
              <DialogTitle>Crear nuevo sorteo</DialogTitle>
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
              <div className="space-y-2">
                <Label>Premio</Label>
                <Input name="prize_description" required className="bg-iwon-bg border-iwon-border" placeholder="Ej: Sesion de videoclip profesional" />
              </div>
              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-black font-semibold">
                Crear sorteo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {raffles.map((raffle) => (
          <Card key={raffle.id} className="bg-iwon-card border-iwon-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="h-4 w-4 text-iwon-success" />
                  {raffle.title}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {raffle.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-3 w-3 text-gold" />
                {raffle.prize_description}
              </div>

              <div className="flex gap-1 flex-wrap">
                {raffle.status === "draft" && (
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleUpdateStatus(raffle.id, "active")}>
                    Activar
                  </Button>
                )}
                {raffle.status === "active" && (
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handlePickWinner(raffle.id)}>
                    <Shuffle className="h-3 w-3 mr-1" />
                    Sortear
                  </Button>
                )}
                {raffle.status === "active" && (
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleUpdateStatus(raffle.id, "cancelled")}>
                    Cancelar
                  </Button>
                )}
              </div>

              {raffle.winner_id && (
                <div className="text-xs text-iwon-success flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Ganador seleccionado
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {raffles.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">No hay sorteos creados.</p>
        )}
      </div>
    </div>
  );
}
