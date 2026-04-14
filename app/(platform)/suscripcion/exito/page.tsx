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
  const [error, setError] = useState<string | null>(null);

  async function linkSubscription() {
    if (!preapprovalId) return;
    setLinking(true);
    setError(null);
    console.log("[Exito] Iniciando vinculación para ID:", preapprovalId);
    
    try {
      const res = await fetch("/api/subscription/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preapproval_id: preapprovalId }),
      });
      
      const data = await res.json();
      console.log("[Exito] Respuesta del servidor:", data);
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Error desconocido");
      }
      
      console.log("[Exito] Vinculación completada con éxito");
    } catch (err: any) {
      console.error("[Exito] Error fatal vinculando:", err);
      setError(err.message);
    } finally {
      setLinking(false);
    }
  }

  useEffect(() => {
    if (preapprovalId && !activated) {
      linkSubscription();
    }
  }, [preapprovalId]);

  useEffect(() => {
    if (activated || polls >= 15 || linking || error) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/subscription/status");
        const data = await res.json();
        console.log("[Exito] Verificando estado en DB:", data.status);
        if (data.status === "active") {
          setActivated(true);
          setTimeout(() => router.replace("/dashboard"), 1500);
        }
      } catch {
        // reintentar
      }
      setPolls((p) => p + 1);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [polls, activated, router, linking, error]);

  if (activated) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4 animate-in fade-in zoom-in duration-500">
        <CheckCircle className="h-20 w-20 text-iwon-success mx-auto" />
        <h1 className="text-3xl font-bold">¡Bienvenido!</h1>
        <p className="text-muted-foreground">Tu suscripción está activa. Entrando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-6">
      <CheckCircle className="h-16 w-16 text-iwon-success mx-auto opacity-50" />
      <h1 className="text-2xl font-bold">Procesando tu acceso</h1>
      
      {error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-bold mb-2">Hubo un problema al vincular tu pago:</p>
          <p className="text-sm mb-4">{error}</p>
          <Button onClick={linkSubscription} variant="destructive">
            Reintentar Vinculación
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {linking ? "Vinculando tu cuenta con Mercado Pago..." : "Esperando confirmación final..."}
          </p>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold" />
        </div>
      )}
      
      <p className="text-xs text-muted-foreground pt-10">
        ID de Operación: {preapprovalId || "No detectado"}
      </p>
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

