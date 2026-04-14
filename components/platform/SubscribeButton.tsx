"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function SubscribeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscription/create", { method: "POST" });
      const data = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        toast.error(`Error al procesar el pago: ${data.message ?? "intentá de nuevo"}`);
        return;
      }

      if (data.redirect) {
        router.push(data.redirect);
        return;
      }

      if (data.init_point) {
        window.location.href = data.init_point;
        return;
      }

      toast.error("No se pudo obtener el link de pago.");
    } catch {
      toast.error("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      className="bg-gold hover:bg-gold-light text-black font-bold text-lg px-8 py-6 h-auto"
      onClick={handleSubscribe}
      disabled={loading}
    >
      {loading ? "Procesando..." : "Suscribite por $14.999/mes"}
      {!loading && <ArrowRight className="ml-2" />}
    </Button>
  );
}
