"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

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
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
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
