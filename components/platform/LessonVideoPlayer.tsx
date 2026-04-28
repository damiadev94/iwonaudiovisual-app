"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "./VideoPlayer";
import { CountdownPlayer } from "./CountdownPlayer";

type State =
  | { kind: "loading" }
  | { kind: "ready"; url: string }
  | { kind: "countdown"; releaseAt: string }
  | { kind: "subscription" }
  | { kind: "error"; message: string };

export type PreloadedVideoState = Exclude<State, { kind: "loading" } | { kind: "error" }>;

interface LessonVideoPlayerProps {
  publicId: string;
  title: string;
  /** Token pre-generado en el server. Si se omite, se fetcha en el cliente (fallback). */
  preloadedState?: PreloadedVideoState;
}

export function LessonVideoPlayer({ publicId, title, preloadedState }: LessonVideoPlayerProps) {
  const [state, setState] = useState<State>(preloadedState ?? { kind: "loading" });

  useEffect(() => {
    // Skip client fetch if the server already provided a valid state
    if (preloadedState) return;

    let cancelled = false;

    async function fetchToken() {
      try {
        const res = await fetch(
          `/api/cursos/video-token?publicId=${encodeURIComponent(publicId)}`
        );

        if (cancelled) return;

        if (res.status === 200) {
          const { url } = await res.json();
          setState({ kind: "ready", url });
          return;
        }
        if (res.status === 403) {
          const body = await res.json().catch(() => ({}));
          if (body.releaseAt) {
            setState({ kind: "countdown", releaseAt: body.releaseAt });
            return;
          }
          setState({ kind: "subscription" });
          return;
        }
        if (res.status === 401) {
          setState({ kind: "subscription" });
          return;
        }
        setState({ kind: "error", message: "No se pudo cargar el video." });
      } catch {
        if (!cancelled) {
          setState({ kind: "error", message: "Error de red." });
        }
      }
    }

    fetchToken();
    return () => {
      cancelled = true;
    };
  }, [publicId, preloadedState]);

  if (state.kind === "loading") {
    return (
      <div className="aspect-video rounded-xl bg-iwon-card border border-iwon-border relative overflow-hidden">
        <Skeleton className="absolute inset-0 bg-white/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold" />
        </div>
      </div>
    );
  }

  if (state.kind === "ready") {
    return <VideoPlayer videoUrl={state.url} publicId={publicId} title={title} />;
  }

  if (state.kind === "countdown") {
    return (
      <CountdownPlayer
        releaseAt={state.releaseAt}
        publicId={publicId}
        title={title}
      />
    );
  }

  if (state.kind === "subscription") {
    return (
      <div className="aspect-video rounded-xl bg-iwon-card border border-iwon-border flex items-center justify-center p-8 text-center">
        <div className="space-y-3">
          <Lock className="h-10 w-10 text-gold mx-auto" />
          <p className="font-medium">Suscripción requerida</p>
          <p className="text-sm text-muted-foreground">
            Activa una suscripción para ver este contenido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl bg-iwon-card border border-iwon-border flex items-center justify-center p-8 text-center">
      <p className="text-sm text-muted-foreground">{state.message}</p>
    </div>
  );
}
