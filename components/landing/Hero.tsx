import { ButtonPrimary } from "@/components/ui/ButtonPrimary";

const stats = [
  { num: "+450", label: "Videoclips filmados" },
  { num: "Gratis", label: "Registro" },
  { num: "100%", label: "Participación automática" },
];

export function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 40px 60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid + noise background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.7) 40%, rgba(8,8,8,0.3) 70%, rgba(8,8,8,0.6) 100%),
            repeating-linear-gradient(90deg, transparent, transparent 99px, rgba(212,168,67,0.04) 99px, rgba(212,168,67,0.04) 100px),
            repeating-linear-gradient(0deg, transparent, transparent 99px, rgba(212,168,67,0.04) 99px, rgba(212,168,67,0.04) 100px)
          `,
          backgroundColor: "#0d0d0d",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />

      {/* Eyebrow */}
      <div
        style={{
          position: "relative",
          fontSize: "11px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#D4A843",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span
          aria-hidden="true"
          style={{ display: "block", width: "32px", height: "1px", background: "#D4A843", flexShrink: 0 }}
        />
        Productora audiovisual · Buenos Aires · Desde 2022
      </div>

      {/* Headline */}
      <h1
        style={{
          position: "relative",
          fontFamily: "var(--font-condensed)",
          fontWeight: 900,
          fontSize: "clamp(72px, 12vw, 140px)",
          lineHeight: 0.88,
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
          margin: 0,
        }}
      >
        <span
          style={{
            display: "block",
            WebkitTextStroke: "1.5px rgba(242,237,228,0.25)",
            color: "transparent",
          }}
        >
          Comenzá
        </span>
        <span style={{ display: "block", color: "#F2EDE4" }}>tu carrera</span>
        <span style={{ display: "block", color: "#D4A843" }}>audiovisual</span>
      </h1>

      {/* Subtitle */}
      <p
        style={{
          position: "relative",
          fontSize: "16px",
          color: "#888",
          marginTop: "28px",
          maxWidth: "480px",
          lineHeight: 1.6,
          fontStyle: "italic",
        }}
      >
        Registrate gratis y participá automáticamente por un videoclip con equipamiento de cine. Sin sellos, sin intermediarios.
      </p>

      {/* CTAs */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginTop: "40px",
          flexWrap: "wrap",
        }}
      >
        <ButtonPrimary href="/register" size="md">
          Registrate gratis
        </ButtonPrimary>
        <a
          href="#portfolio"
          style={{
            color: "#F2EDE4",
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-body)",
            textDecoration: "none",
          }}
        >
          <span
            aria-hidden="true"
            style={{ display: "block", width: "20px", height: "1px", background: "#F2EDE4" }}
          />
          Ver portfolio
        </a>
      </div>

      {/* Stats */}
      <div
        style={{
          position: "relative",
          display: "flex",
          gap: "48px",
          marginTop: "60px",
          flexWrap: "wrap",
        }}
      >
        {stats.map(({ num, label }) => (
          <div key={label}>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontWeight: 900,
                fontSize: "36px",
                color: "#D4A843",
                lineHeight: 1,
              }}
            >
              {num}
            </div>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#888",
                marginTop: "4px",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
