"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuscripcionExitoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preapprovalId = searchParams.get("preapproval_id");

  const [polls, setPolls] = useState(0);
  const [activated, setActivated] = useState(false);
  const [linking, setLinking] = useState(!!preapprovalId);

  // Efecto 1: Vincular la suscripción si viene el preapproval_id
  useEffect(() => {
    if (!preapprovalId || activated) return;

    async function linkSubscription() {
      try {
        await fetch("/api/subscription/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preapproval_id: preapprovalId }),
        });
      } catch (error) {
        console.error("Error linking subscription:", error);
      } finally {
        setLinking(false);
      }
    }

    linkSubscription();
  }, [preapprovalId, activated]);

  // Efecto 2: Polling para verificar activación
  useEffect(() => {
    if (activated || polls >= 15 || linking) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/subscription/status");
        const data = await res.json();
        if (data.status === "active") {
          setActivated(true);
          setTimeout(() => router.replace("/dashboard"), 2000);
          return;
        }
      } catch {
        // ignorar errores de red y reintentar
      }
      setPolls((p) => p + 1);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [polls, activated, router, linking]);

  if (activated) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4 animate-in fade-in zoom-in duration-500">
        <CheckCircle className="h-16 w-16 text-iwon-success mx-auto" />
        <h1 className="text-2xl font-bold">¡Suscripción activada!</h1>
        <p className="text-muted-foreground">Bienvenido a la comunidad IWON. Redirigiendo...</p>
      </div>
    );
  }

  if (polls >= 15) {
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
      <p className="text-muted-foreground">
        {linking ? "Vinculando suscripción..." : "Activando tu acceso..."}
      </p>
      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
    </div>
  );
}

export default function SuscripcionExitoPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>}>
      <SuscripcionExitoContent />
    </Suspense>
  );
}

