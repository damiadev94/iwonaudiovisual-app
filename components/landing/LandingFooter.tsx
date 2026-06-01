// Client component only because of onMouseEnter/Leave hover handlers on links
"use client";

const footerLinks = [
  { label: "Instagram", href: "https://instagram.com/iwonaudiovisual" },
  { label: "YouTube", href: "https://youtube.com/@iwonaudiovisual" },
  { label: "Privacidad", href: "/politica-de-privacidad" },
];

export function LandingFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid #2A2A2A",
        padding: "32px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <p style={{ fontSize: "11px", color: "#888", letterSpacing: "0.1em", margin: 0 }}>
        © 2026 Iwon Audiovisual. Todos los derechos reservados.
      </p>
      <nav aria-label="Links del footer">
        <ul
          style={{
            display: "flex",
            gap: "24px",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {footerLinks.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="landing-footer-link"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#888",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
