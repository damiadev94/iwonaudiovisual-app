"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Mostrar mensajes según parámetros de URL
  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      toast.success("Email confirmado. Ya podés iniciar sesión.");
    }
    if (searchParams.get("error") === "invalid_token") {
      toast.error("El link de confirmación es inválido.");
    }
    if (searchParams.get("error") === "server_error") {
      toast.error("Ocurrió un error. Intentá de nuevo.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const result = loginSchema.safeParse(data);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      toast.error("Credenciales incorrectas");
      setLoading(false);
      return;
    }

    // Verificar que el email esté confirmado en nuestra tabla profiles.
    // Usamos el cliente del usuario (RLS garantiza que solo lee su propio perfil).
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("email_confirmed")
      .eq("id", user!.id)
      .single();

    if (!profile?.email_confirmed) {
      // Cerrar sesión para no dejar al usuario en estado inconsistente
      await supabase.auth.signOut();
      router.push(`/confirm-email?email=${encodeURIComponent(data.email)}`);
      return;
    }

    // Sesión válida y email confirmado → middleware redirige a /dashboard
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
    if (error) toast.error("Error al iniciar sesion con Google");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-iwon-bg px-4">
      <Card className="w-full max-w-md bg-iwon-card border-iwon-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Iniciar sesion</CardTitle>
          <CardDescription>Ingresa a tu cuenta de Iwon Audiovisual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full border-iwon-border hover:bg-iwon-bg-secondary"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-iwon-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-iwon-card px-2 text-muted-foreground">o</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                className="bg-iwon-bg border-iwon-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-iwon-bg border-iwon-border"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gold hover:bg-gold-light text-black font-semibold"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            No tenes cuenta?{" "}
            <Link href="/register" className="text-gold hover:text-gold-light transition-colors">
              Registrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    // Suspense requerido por useSearchParams en componentes client
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
