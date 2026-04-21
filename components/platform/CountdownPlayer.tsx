"use client";

import { useEffect, useRef, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";

interface CountdownPlayerProps {
  releaseAt: string;
  publicId: string;
  title: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function diffToParts(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    done: false,
  };
}

export function CountdownPlayer({ releaseAt, publicId, title }: CountdownPlayerProps) {
  const targetMs = new Date(releaseAt).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => diffToParts(targetMs));
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function tryFetchToken() {
      setUnlocking(true);
      try {
        const res = await fetch(
          `/api/cursos/video-token?publicId=${encodeURIComponent(publicId)}`
        );
        if (res.status === 200) {
          const { url } = await res.json();
          setUnlockedUrl(url);
          setErrorMessage(null);
          return;
        }
        if (res.status === 403) {
          const body = await res.json().catch(() => ({}));
          // Si el body incluye releaseAt, es que el servidor todavía no considera disponible (condición de carrera)
          if (body.releaseAt) {
            setTimeout(tryFetchToken, 5000);
          } else {
            setErrorMessage(body.error || "Suscripción requerida o acceso denegado.");
          }
          return;
        }
        if (res.status === 401) {
          setErrorMessage("Suscripción requerida.");
          return;
        }
        setErrorMessage("No se pudo obtener el video.");
      } catch {
        setErrorMessage("Error de red al obtener el video.");
      } finally {
        setUnlocking(false);
      }
    }

    intervalRef.current = setInterval(() => {
      const next = diffToParts(targetMs);
      setTimeLeft(next);
      if (next.done) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        tryFetchToken();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetMs, publicId]);

  if (unlockedUrl) {
    return <VideoPlayer videoUrl={unlockedUrl} publicId={publicId} title={title} />;
  }

  if (timeLeft.done) {
    return (
      <div className="aspect-video rounded-xl bg-iwon-card border border-iwon-border flex items-center justify-center p-8 text-center">
        <div className="space-y-3">
          {unlocking && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto" />
          )}
          <p className="text-sm text-muted-foreground">
            {errorMessage ?? "Desbloqueando video..."}
          </p>
        </div>
      </div>
    );
  }

  const items = [
    { label: "Días", val: timeLeft.days },
    { label: "Horas", val: timeLeft.hours },
    { label: "Mins", val: timeLeft.minutes },
    { label: "Segs", val: timeLeft.seconds },
  ];

  return (
    <div className="aspect-video rounded-xl bg-gradient-to-br from-iwon-bg/95 via-black to-iwon-bg border border-gold/20 flex flex-col items-center justify-center p-8">
      <span className="mb-6 text-[10px] uppercase font-black tracking-[0.3em] text-gold">
        Próximamente
      </span>
      <div className="grid grid-cols-4 gap-3 md:gap-6">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-2 shadow-2xl">
              <span className="text-2xl md:text-4xl font-black text-gold tabular-nums">
                {item.val.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
