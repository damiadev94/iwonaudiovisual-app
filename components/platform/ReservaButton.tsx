"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ReservaButtonProps {
  promoId: string;
  promoTitle: string;
  isSoldOut: boolean;
}

export function ReservaButton({ promoId, promoTitle, isSoldOut }: ReservaButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleReserva() {
    setLoading(true);
    try {
      const res = await fetch("/api/promos/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promo_id: promoId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al reservar");
        return;
      }

      setToken(data.booking_token);
      setWhatsappLink(data.whatsapp_link ?? null);
      setConfirmOpen(false);
      setSuccessOpen(true);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyToken() {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Append token as pre-filled message to the base wa.me link
  function buildWhatsappUrl() {
    if (!whatsappLink || !token) return null;
    const separator = whatsappLink.includes("?") ? "&" : "?";
    const text = encodeURIComponent(
      `Hola! Reservé la promo "${promoTitle}". Mi código de reserva es: ${token}`
    );
    return `${whatsappLink}${separator}text=${text}`;
  }

  const waUrl = buildWhatsappUrl();

  return (
    <>
      <Button
        className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
        disabled={isSoldOut || loading}
        onClick={() => setConfirmOpen(true)}
      >
        {isSoldOut ? "Agotado" : "Reservar"}
      </Button>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-iwon-card border-iwon-border">
          <DialogHeader>
            <DialogTitle>Confirmar reserva</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Querés reservar un cupo para <span className="text-foreground font-medium">{promoTitle}</span>?
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-gold hover:bg-gold-light text-black font-semibold"
              onClick={handleReserva}
              disabled={loading}
            >
              {loading ? "Reservando..." : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="bg-iwon-card border-iwon-border">
          <DialogHeader>
            <DialogTitle>¡Reserva confirmada!</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tu cupo para <span className="text-foreground font-medium">{promoTitle}</span> está reservado.
              Guardá tu código:
            </p>

            <div className="flex items-center gap-2 bg-iwon-bg rounded-lg px-4 py-3">
              <code className="flex-1 text-gold font-mono text-sm tracking-wider break-all">
                {token}
              </code>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 h-8 w-8"
                onClick={handleCopyToken}
              >
                {copied ? <Check className="h-4 w-4 text-iwon-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Usá este código al contactarnos para que podamos identificar tu reserva.
            </p>

            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Hablar por WhatsApp
                </Button>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
