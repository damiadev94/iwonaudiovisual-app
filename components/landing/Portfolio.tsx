import { Play } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PortfolioItem } from "@/types";

export async function Portfolio() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("portfolio")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);

  const items: PortfolioItem[] = data || [];

  return (
    <section id="portfolio" className="py-24 bg-iwon-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Mas de <span className="text-gold">450 videoclips</span> producidos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conoce nuestro trabajo. Cada videoclip filmado con equipamiento de
            cine profesional.
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.youtube_link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-video rounded-lg overflow-hidden border border-iwon-border hover:border-gold/30 transition-all duration-300 cursor-pointer block"
              >
                {/* Cover image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url_portada}
                  alt={`${item.nombre_tema} - ${item.nombre_artista}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 p-3">
                  <Play className="h-7 w-7 text-white mb-0.5" fill="white" />
                  <p className="text-sm font-semibold text-white text-center leading-tight">
                    {item.nombre_tema}
                  </p>
                  <p className="text-xs text-gold text-center">
                    {item.nombre_artista}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          /* Fallback placeholder mientras no hay items cargados */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="group relative aspect-video rounded-lg overflow-hidden bg-iwon-card border border-iwon-border"
              >
                <div className="absolute inset-0 bg-linear-to-br from-gold/10 to-iwon-card flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <Play className="h-5 w-5 text-gold" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Mas de 500 videoclips filmados.
          </p>
        </div>
      </div>
    </section>
  );
}
