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
    <div className="aspect-video rounded-xl overflow-hidden bg-black relative border border-iwon-border shadow-2xl">
      <iframe
        src={videoUrl}
        className="absolute top-0 left-0 w-full h-full border-none"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        title={title}
      />
    </div>
  );
}
