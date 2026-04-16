"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const supabase = createClient();
      // El template en Supabase Dashboard ya construye la URL con token_hash.
      // No se necesita redirectTo adicional.
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        toast.error("Error al enviar el email. Intentá de nuevo.");
        return;
      }

      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
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
            <CardTitle className="text-2xl">Revisá tu email</CardTitle>
            <CardDescription>
              Si <strong>{email}</strong> tiene una cuenta, vas a recibir un link para
              restablecer tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              ¿No lo encontrás? Revisá la carpeta de spam.
            </p>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-iwon-bg px-4">
      <Card className="w-full max-w-md bg-iwon-card border-iwon-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Restablecer contraseña</CardTitle>
          <CardDescription>
            Ingresá tu email y te enviamos un link para crear una nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? "Enviando..." : "Enviar link de recuperación"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-foreground underline underline-offset-4">
              Volver al login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
