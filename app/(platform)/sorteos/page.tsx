"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, CheckCircle, Trophy, Calendar, Crown, Clock, LogOut } from "lucide-react";
import { toast } from "sonner";
import type { Raffle } from "@/types";

function getTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.total <= 0) {
    return <span className="text-muted-foreground text-xs">Sorteo en proceso</span>;
  }

  const blocks = [
    { value: timeLeft.days, label: "d" },
    { value: timeLeft.hours, label: "h" },
    { value: timeLeft.minutes, label: "m" },
    { value: timeLeft.seconds, label: "s" },
  ];

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="h-3.5 w-3.5 text-gold shrink-0" />
      <div className="flex items-center gap-1">
        {blocks.map(({ value, label }) => (
          <div key={label} className="flex items-baseline gap-0.5">
            <span className="font-mono text-sm font-bold text-white tabular-nums w-5 text-right">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SorteosPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [entries, setEntries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

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

  async function handleWithdraw(raffleId: string) {
    if (!userId) return;
    setWithdrawing(raffleId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("raffle_entries")
        .delete()
        .eq("raffle_id", raffleId)
        .eq("user_id", userId);

      if (error) {
        toast.error("Error al retirarse del sorteo");
        return;
      }

      setEntries(entries.filter((id) => id !== raffleId));
      toast.success("Te retiraste del sorteo");
    } catch {
      toast.error("Error al retirarse del sorteo");
    } finally {
      setWithdrawing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Cargando sorteos...</div>
      </div>
    );
  }

  const activeRaffles = raffles.filter((r) => r.status === "active");
  const winners = raffles.filter((r) => r.status === "completed" && r.winner_name);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Sorteos</h1>
        <p className="text-muted-foreground">
          Participá en sorteos exclusivos para suscriptores y ganá premios increíbles.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Sorteos Activos</h2>
            {activeRaffles.length === 0 ? (
              <Card className="bg-iwon-card border-iwon-border">
                <CardContent className="py-12 text-center">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No hay sorteos activos</h3>
                  <p className="text-muted-foreground">Próximamente nuevos sorteos exclusivos.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeRaffles.map((raffle) => {
                  const hasEntered = entries.includes(raffle.id);

                  return (
                    <Card key={raffle.id} className="bg-iwon-card border-iwon-border overflow-hidden flex flex-col">
                      <div className="h-1 bg-gradient-to-r from-iwon-success to-emerald-400" />

                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Gift className="h-5 w-5 text-iwon-success" />
                            {raffle.title}
                          </CardTitle>
                          <Badge variant="outline" className="bg-iwon-success/10 text-iwon-success border-iwon-success/20">
                            Activo
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 flex-1 flex flex-col">
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
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(raffle.draw_date).toLocaleDateString("es-AR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                            <CountdownTimer targetDate={raffle.draw_date} />
                          </div>
                        )}

                        <div className="mt-auto pt-2">
                          {hasEntered ? (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-iwon-success text-sm">
                                <CheckCircle className="h-4 w-4 shrink-0" />
                                Ya estás participando
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-iwon-error hover:bg-iwon-error/10"
                                onClick={() => handleWithdraw(raffle.id)}
                                disabled={withdrawing === raffle.id}
                              >
                                <LogOut className="h-3.5 w-3.5 mr-1" />
                                {withdrawing === raffle.id ? "Saliendo..." : "Salir"}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
                              onClick={() => handleParticipate(raffle.id)}
                              disabled={participating === raffle.id}
                            >
                              {participating === raffle.id ? "Participando..." : "Participar"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: últimos ganadores */}
        <div className="w-full lg:w-72 shrink-0">
          <Card className="bg-iwon-card border-iwon-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-4 w-4 text-gold" />
                Últimos Ganadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {winners.length === 0 ? (
                <div className="text-center py-6">
                  <Trophy className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Aún no hay ganadores.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">¡El próximo podrías ser vos!</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {winners.map((raffle) => (
                    <li key={raffle.id} className="flex items-start gap-3">
                      <div className="bg-gold/15 rounded-full p-1.5 shrink-0 mt-0.5">
                        <Trophy className="h-3.5 w-3.5 text-gold" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{raffle.winner_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{raffle.title}</p>
                        {raffle.draw_date && (
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {new Date(raffle.draw_date).toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
