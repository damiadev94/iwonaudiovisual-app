"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { Mail } from "lucide-react";
import { toast } from "sonner";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const hasExpiredError = searchParams.get("error") === "token_expired";

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Mostrar aviso si llegaron desde un link expirado
  useEffect(() => {
    if (hasExpiredError) {
      toast.error("El link expiró. Pedí uno nuevo.");
    }
  }, [hasExpiredError]);

  // Countdown de cooldown después de reenviar
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (!email || sending || cooldown > 0) return;
    setSending(true);

    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Error al reenviar. Intentá de nuevo.");
      } else {
        toast.success("Email reenviado. Revisá tu bandeja.");
        setSent(true);
        setCooldown(60);
      }
    } catch {
      toast.error("Error de red. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-iwon-bg px-4">
      <Card className="w-full max-w-md bg-iwon-card border-iwon-border text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-gold" />
          </div>
          <CardTitle className="text-2xl">Revisa tu email</CardTitle>
          <CardDescription>
            {email
              ? `Te enviamos un link de confirmación a ${email}.`
              : "Te enviamos un link de confirmación a tu email."}
            {" "}Hace click en el link para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No lo encontras? Revisa la carpeta de spam.
          </p>

          {/* Botón de reenvío — solo si tenemos el email */}
          {email && (
            <Button
              variant="outline"
              className="w-full border-iwon-border hover:bg-iwon-bg-secondary"
              onClick={handleResend}
              disabled={sending || cooldown > 0}
            >
              {sending
                ? "Enviando..."
                : cooldown > 0
                  ? `Reenviar en ${cooldown}s`
                  : sent
                    ? "Reenviar de nuevo"
                    : "Reenviar email de confirmación"}
            </Button>
          )}

          <Link href="/login">
            <Button variant="ghost" className="w-full text-muted-foreground">
              Volver al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    // Suspense requerido por useSearchParams en componentes client
    <Suspense>
      <ConfirmEmailContent />
    </Suspense>
  );
}
