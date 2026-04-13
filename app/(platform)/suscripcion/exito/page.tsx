"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_POLLS = 15;
const POLL_INTERVAL_MS = 3000;

export default function SuscripcionExitoPage() {
  const router = useRouter();
  const [polls, setPolls] = useState(0);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (activated || polls >= MAX_POLLS) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/subscription/status");
        const data = await res.json();
        if (data.status === "active") {
          setActivated(true);
          router.replace("/dashboard");
          return;
        }
      } catch {
        // ignorar errores de red y reintentar
      }
      setPolls((p) => p + 1);
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timeout);
  }, [polls, activated, router]);

  if (activated) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <CheckCircle className="h-16 w-16 text-iwon-success mx-auto" />
        <h1 className="text-2xl font-bold">¡Suscripción activada!</h1>
        <p className="text-muted-foreground">Redirigiendo al dashboard...</p>
      </div>
    );
  }

  if (polls >= MAX_POLLS) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <CheckCircle className="h-16 w-16 text-gold mx-auto" />
        <h1 className="text-2xl font-bold">¡Pago recibido!</h1>
        <p className="text-muted-foreground">
          Tu suscripción se está procesando. Puede demorar unos minutos en activarse.
        </p>
        <Button onClick={() => router.replace("/dashboard")} className="bg-gold hover:bg-gold-light text-black font-bold">
          Ir al dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-4">
      <CheckCircle className="h-16 w-16 text-iwon-success mx-auto" />
      <h1 className="text-2xl font-bold">¡Pago realizado!</h1>
      <p className="text-muted-foreground">Activando tu suscripción...</p>
      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
    </div>
  );
}
