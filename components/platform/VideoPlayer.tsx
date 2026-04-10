"use client";

import { Play } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string | null;
  publicId: string | null;
  title: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  if (!videoUrl) {
    return (
      <div className="aspect-video rounded-xl bg-iwon-card border border-iwon-border flex items-center justify-center">
        <div className="text-center">
          <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Video no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black">
      <video
        src={videoUrl}
        controls
        className="w-full h-full"
        title={title}
        preload="metadata"
      >
        Tu navegador no soporta el reproductor de video.
      </video>
    </div>
  );
}
