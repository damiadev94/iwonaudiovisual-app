"use client";

import { Play } from "lucide-react";

const videos = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `Videoclip ${i + 1}`,
  artist: `Artista ${i + 1}`,
  thumbnail: `/api/placeholder/400/225`,
}));

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-iwon-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Mas de <span className="text-gold">450 videoclips</span> producidos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conoce nuestro trabajo. Cada videoclip filmado con equipamiento de cine profesional.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group relative aspect-video rounded-lg overflow-hidden bg-iwon-card border border-iwon-border hover:border-gold/30 transition-all duration-300 cursor-pointer"
            >
              {/* Placeholder thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-iwon-card flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-gold/40 transition-colors">
                    <Play className="h-5 w-5 text-gold" />
                  </div>
                  <p className="text-xs text-muted-foreground">{video.artist}</p>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div>
                  <p className="text-sm font-semibold">{video.title}</p>
                  <p className="text-xs text-gold">{video.artist}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Mas de 500 videoclips filmados.
          </p>
        </div>
      </div>
    </section>
  );
}
