"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink, Instagram } from "lucide-react";

const INSTAGRAM_DM_URL = "https://ig.me/m/iwonaudiovisual";

export function WelcomeModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("welcome") === "true") {
      setOpen(true);
    }
  }, [searchParams]);

  function handleClose() {
    setOpen(false);
    router.replace("/dashboard");
  }

  function handleInstagram() {
    window.open(INSTAGRAM_DM_URL, "_blank", "noopener,noreferrer");
    handleClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-iwon-card border border-iwon-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold via-yellow-300 to-gold" />

        <div className="p-8 space-y-6 text-center">
          {/* Icon + heading */}
          <div className="space-y-2">
            <div className="text-4xl">🎉</div>
            <h2 className="text-2xl font-bold tracking-tight">
              ¡REGISTRO COMPLETADO CON ÉXITO!
            </h2>
          </div>

          {/* Alert banner */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-left">
            <span className="text-xl mt-0.5">⚠️</span>
            <p className="text-sm font-semibold text-amber-400 leading-snug">
              ÚLTIMO PASO OBLIGATORIO PARA RESERVAR TU FECHA
            </p>
          </div>

          {/* Body */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            Para coordinar el día de rodaje, la locación y el estilo de tu video,
            mandanos ahora mismo un mensaje privado a nuestro Instagram con la palabra:
          </p>

          {/* Keyword */}
          <div className="inline-block px-6 py-3 bg-gold/10 border border-gold/40 rounded-xl">
            <span className="text-3xl font-black tracking-widest text-gold">
              ONESHOT
            </span>
          </div>

          {/* Note */}
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Debido a la alta demanda de la promo, solo reservamos el lugar a los
            artistas que nos confirmen su idea por mensaje privado.
          </p>

          {/* CTA */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleInstagram}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-base py-6 rounded-xl gap-2"
            >
              <Instagram className="h-5 w-5" />
              Escribir a Instagram ahora
              <ExternalLink className="h-4 w-4 opacity-70" />
            </Button>

            <button
              onClick={handleClose}
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-4"
            >
              Lo hago después
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
