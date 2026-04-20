"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 md:px-10 py-5"
      style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.95), transparent)" }}
    >
      <Link
        href="/"
        className="font-condensed font-black text-[22px] tracking-[0.15em] text-gold"
      >
        IWON
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <a href="#portfolio" className="text-[11px] tracking-[0.18em] uppercase text-[#888] hover:text-foreground transition-colors">
          Portfolio
        </a>
        <a href="#como-funciona" className="text-[11px] tracking-[0.18em] uppercase text-[#888] hover:text-foreground transition-colors">
          Cómo funciona
        </a>
        <a href="#faq" className="text-[11px] tracking-[0.18em] uppercase text-[#888] hover:text-foreground transition-colors">
          FAQ
        </a>
        <Link href="/login" className="text-[11px] tracking-[0.18em] uppercase text-[#888] hover:text-foreground transition-colors">
          Ingresar
        </Link>
      </div>

      <button
        className="md:hidden text-foreground"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-iwon-bg/95 backdrop-blur-md px-5 py-6 space-y-5 md:hidden border-t border-iwon-border">
          <a href="#portfolio" className="block text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
            Portfolio
          </a>
          <a href="#como-funciona" className="block text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
            Cómo funciona
          </a>
          <a href="#faq" className="block text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
            FAQ
          </a>
          <Link href="/login" className="block text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>
            Ingresar
          </Link>
          <Link href="/register" className="block text-sm font-condensed font-black uppercase tracking-wider text-gold" onClick={() => setIsOpen(false)}>
            Suscribite
          </Link>
        </div>
      )}
    </nav>
  );
}
