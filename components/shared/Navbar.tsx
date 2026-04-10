"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-iwon-bg/80 backdrop-blur-md border-b border-iwon-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Como funciona
            </a>
            <a href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Beneficios
            </a>
            <a href="#portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Portfolio
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Precio
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
            <Link href="/login">
              <Button variant="ghost" size="sm">Iniciar sesion</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gold hover:bg-gold-light text-black font-semibold">
                Suscribite
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <a href="#como-funciona" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
              Como funciona
            </a>
            <a href="#beneficios" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
              Beneficios
            </a>
            <a href="#portfolio" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
              Portfolio
            </a>
            <a href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
              Precio
            </a>
            <a href="#faq" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
              FAQ
            </a>
            <div className="flex gap-2 pt-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Iniciar sesion</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gold hover:bg-gold-light text-black font-semibold">
                  Suscribite
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
