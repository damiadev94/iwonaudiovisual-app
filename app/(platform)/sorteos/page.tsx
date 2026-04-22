"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, CheckCircle, Trophy, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Raffle } from "@/types";

export default function SorteosPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [entries, setEntries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rafflesData } = await supabase
        .from("raffles")
        .select("*")
        .neq("status", "draft")
        .order("created_at", { ascending: false });

      const { data: entriesData } = await supabase
        .from("raffle_entries")
        .select("raffle_id")
        .eq("user_id", user.id);

      setRaffles((rafflesData || []) as Raffle[]);
      setEntries((entriesData || []).map((e: { raffle_id: string }) => e.raffle_id));
      setLoading(false);
    }

    fetchData();
  }, []);

  async function handleParticipate(raffleId: string) {
    setParticipating(raffleId);
    try {
      const res = await fetch("/api/sorteos/participar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raffle_id: raffleId }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Error al participar");
        return;
      }

      setEntries([...entries, raffleId]);
      toast.success("¡Ya estás participando en el sorteo!");
    } catch {
      toast.error("Error al participar");
    } finally {
      setParticipating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Cargando sorteos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Sorteos</h1>
        <p className="text-muted-foreground">
          Participá en sorteos exclusivos para suscriptores y ganá premios increíbles.
        </p>
      </div>

      {/* Sorteo Especial Automático */}
      <Card className="bg-gradient-to-br from-gold/15 via-iwon-card to-iwon-card border-gold/40 overflow-hidden relative shadow-[0_0_30px_rgba(212,175,55,0.15)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold to-yellow-200" />

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gold font-bold tracking-wider text-sm uppercase mb-2">
                <Sparkles className="h-4 w-4" /> Gran Sorteo Especial
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Grabación de un EP (4 Canciones)
              </CardTitle>
            </div>
            <Badge className="bg-gold/10 text-gold border-gold/30 px-3 py-1 uppercase tracking-widest hidden md:inline-flex">
              Beneficio Exclusivo
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <p className="text-muted-foreground text-sm md:text-base max-w-3xl leading-relaxed">
            Estamos buscando a 1 artista para producirle y grabarle un EP completo de 4 canciones en máxima calidad, totalmente sin cargo. Como agradecimiento por ser parte de la comunidad IWON, tenés entrada directa asegurada.
          </p>

          <div className="flex items-center gap-4 bg-iwon-success/10 border border-iwon-success/20 p-5 rounded-xl shadow-inner">
            <div className="bg-iwon-success/20 p-2.5 rounded-full shrink-0">
              <CheckCircle className="h-6 w-6 text-iwon-success" />
            </div>
            <div>
              <p className="font-bold text-iwon-success text-base md:text-lg tracking-wide uppercase">
                ¡Ya estás participando!
              </p>
              <p className="text-sm text-iwon-success/90 mt-0.5">
                Por tener tu suscripción activa, tu nombre ya está adentro del sorteo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Más Sorteos Activos
        </h2>
        {raffles.length === 0 ? (
          <Card className="bg-iwon-card border-iwon-border">
            <CardContent className="py-12 text-center">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No hay sorteos activos</h3>
              <p className="text-muted-foreground">Próximamente nuevos sorteos exclusivos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {raffles.map((raffle) => {
              const hasEntered = entries.includes(raffle.id);
              const isActive = raffle.status === "active";
              const isCompleted = raffle.status === "completed";

              return (
                <Card key={raffle.id} className="bg-iwon-card border-iwon-border overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-iwon-success to-emerald-400" />

                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Gift className="h-5 w-5 text-iwon-success" />
                        {raffle.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          isActive
                            ? "bg-iwon-success/10 text-iwon-success border-iwon-success/20"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {isActive ? "Activo" : isCompleted ? "Finalizado" : raffle.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {raffle.description && (
                      <p className="text-sm text-muted-foreground">{raffle.description}</p>
                    )}

                    <div className="p-3 rounded-lg bg-iwon-bg">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="h-4 w-4 text-gold" />
                        <span className="text-sm font-medium">Premio</span>
                      </div>
                      <p className="text-sm text-gold">{raffle.prize_description}</p>
                    </div>

                    {raffle.draw_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Sorteo: {new Date(raffle.draw_date).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    )}

                    {isActive && !hasEntered && (
                      <Button
                        className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
                        onClick={() => handleParticipate(raffle.id)}
                        disabled={participating === raffle.id}
                      >
                        {participating === raffle.id ? "Participando..." : "Participar"}
                      </Button>
                    )}

                    {hasEntered && (
                      <div className="flex items-center gap-2 text-iwon-success text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Ya estás participando
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
