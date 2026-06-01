"use client";

import { useState } from "react";
import Link from "next/link";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";

const navLinks = [
  { label: "Portfolio", href: "#portfolio" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Contacto", href: "#contacto" },
];

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      aria-label="Navegación principal"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        background: "linear-gradient(to bottom, rgba(8,8,8,0.95), transparent)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        aria-label="Iwon Audiovisual — Inicio"
        style={{
          fontFamily: "var(--font-condensed)",
          fontWeight: 900,
          fontSize: "22px",
          letterSpacing: "0.15em",
          color: "#D4A843",
          textDecoration: "none",
        }}
      >
        IWON
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex" style={{ gap: "32px", alignItems: "center" }}>
        {navLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#888",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F2EDE4")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
          >
            {label}
          </a>
        ))}
        <ButtonPrimary href="/register" size="sm">
          Registrate gratis
        </ButtonPrimary>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          color: "#F2EDE4",
          cursor: "pointer",
          fontSize: "20px",
          lineHeight: 1,
        }}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Mobile dropdown */}
      {isOpen && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(8,8,8,0.98)",
            padding: "20px 40px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            borderTop: "1px solid #2A2A2A",
          }}
        >
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#888",
                textDecoration: "none",
              }}
            >
              {label}
            </a>
          ))}
          <ButtonPrimary href="/register" size="sm">
            Registrate gratis
          </ButtonPrimary>
        </div>
      )}
    </nav>
  );
}
