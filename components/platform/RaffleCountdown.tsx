"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Gift, Trophy, Calendar } from "lucide-react";
import type { Raffle } from "@/types";

export function RaffleCountdown({ raffle }: { raffle: Raffle | null }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const drawDate = raffle?.draw_date;
    if (!drawDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(drawDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [raffle]);

  if (!raffle) {
    return (
      <div className="bg-iwon-card border border-iwon-border rounded-2xl p-6 text-center">
        <Gift className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
        <h3 className="font-semibold text-muted-foreground">Próximos sorteos muy pronto</h3>
        <p className="text-xs text-muted-foreground mt-1 text-balance">
          Mantené tu suscripción activa para participar automáticamente en todos los sorteos exclusivos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-iwon-card border border-gold/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.1)] group">
      <div className="bg-gold/10 p-4 border-b border-gold/20 flex items-center justify-between">
        <Badge className="bg-gold text-black font-black text-[10px] tracking-widest uppercase">
          PRÓXIMO SORTEO
        </Badge>
        <div className="flex items-center gap-2 text-xs font-bold text-gold">
          <Calendar className="h-3.5 w-3.5" />
          {raffle.draw_date && new Date(raffle.draw_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
        </div>
      </div>
      
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h2 className="text-3xl font-black text-white tracking-tighter leading-none">
            {raffle.title}
          </h2>
          <div className="flex items-center justify-center md:justify-start gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
            <Trophy className="h-5 w-5 text-gold shrink-0" />
            <span className="font-bold text-gold-light">{raffle.prize_description}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 md:gap-4 shrink-0">
          {[
            { l: "Días", v: timeLeft?.d ?? 0 },
            { l: "Hrs", v: timeLeft?.h ?? 0 },
            { l: "Min", v: timeLeft?.m ?? 0 },
            { l: "Seg", v: timeLeft?.s ?? 0 },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-black/40 border border-white/10 w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-1">
                <span className="text-xl md:text-2xl font-black text-white tabular-nums">
                  {item.v.toString().padStart(2, "0")}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{item.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
