import { createAdminClient } from "@/lib/supabase/admin";
import type { PortfolioItem } from "@/types";

export async function PortfolioSection() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("portfolio")
    .select("*")
    .order("created_at", { ascending: false });

  const items: PortfolioItem[] = data || [];

  return (
    <section
      id="portfolio"
      style={{ padding: "100px 40px", background: "#111111" }}
    >
      {/* Section tag */}
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#D4A843",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        — Portfolio
      </div>

      {/* Heading */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "24px",
          marginBottom: "60px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-condensed)",
            fontWeight: 900,
            fontSize: "clamp(42px, 7vw, 80px)",
            textTransform: "uppercase",
            lineHeight: 0.9,
            letterSpacing: "-0.01em",
          }}
        >
          Más de{" "}
          <em style={{ fontStyle: "normal", color: "#D4A843" }}>450 videoclips</em>
          <br />
          filmados.
        </div>
        <p
          style={{
            fontSize: "14px",
            color: "#888",
            maxWidth: "320px",
            lineHeight: 1.7,
          }}
        >
          Cada videoclip filmado con equipamiento de cine profesional. Este es
          nuestro trabajo.
        </p>
      </div>

      {/* Grid */}
      {items.length > 0 ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          style={{ gap: "1px", background: "#2A2A2A" }}
        >
          {items.map((item) => (
            <a
              key={item.id}
              href={item.youtube_link}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              style={{
                position: "relative",
                display: "block",
                aspectRatio: "16/9",
                overflow: "hidden",
                background: "#161616",
              }}
            >
              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url_portada}
                alt={`${item.nombre_tema} — ${item.nombre_artista}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.35s ease",
                }}
                className="group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(8,8,8,0.75)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                }}
                className="group-hover:opacity-100"
              >
                {/* Play diamond */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "#D4A843",
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "4px",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="12"
                    height="14"
                    viewBox="0 0 12 14"
                    fill="none"
                    style={{ marginLeft: "2px" }}
                  >
                    <path d="M0 0L12 7L0 14V0Z" fill="#000" />
                  </svg>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-condensed)",
                    fontWeight: 800,
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "#F2EDE4",
                    textAlign: "center",
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {item.nombre_tema}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#D4A843",
                    textAlign: "center",
                    letterSpacing: "0.08em",
                    margin: 0,
                  }}
                >
                  {item.nombre_artista}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        /* Placeholder grid while portfolio loads */
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          style={{ gap: "1px", background: "#2A2A2A" }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "16/9",
                background: "#161616",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: "24px",
                  height: "24px",
                  background: "rgba(212,168,67,0.15)",
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
