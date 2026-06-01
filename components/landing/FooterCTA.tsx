import { ButtonPrimary } from "@/components/ui/ButtonPrimary";

export function FooterCTA() {
  return (
    <section
      style={{
        padding: "120px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ghost text background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-condensed)",
          fontWeight: 900,
          fontSize: "22vw",
          color: "rgba(212,168,67,0.04)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          letterSpacing: "-0.02em",
          userSelect: "none",
        }}
      >
        IWON
      </div>

      <h2
        style={{
          position: "relative",
          fontFamily: "var(--font-condensed)",
          fontWeight: 900,
          fontSize: "clamp(48px, 8vw, 96px)",
          textTransform: "uppercase",
          lineHeight: 0.9,
          margin: 0,
        }}
      >
        Tu próximo videoclip
        <em style={{ fontStyle: "normal", color: "#D4A843", display: "block" }}>
          ya tiene productora.
        </em>
      </h2>

      <p
        style={{
          color: "#888",
          margin: "24px 0 40px",
          position: "relative",
          fontStyle: "italic",
        }}
      >
        Registrate gratis · Participás automáticamente en el sorteo mensual
      </p>

      <div style={{ position: "relative" }}>
        <ButtonPrimary href="/register" size="lg">
          Registrate gratis
        </ButtonPrimary>
      </div>
    </section>
  );
}
