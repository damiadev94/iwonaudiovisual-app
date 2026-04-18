import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSubscriptionStatus } from "@/lib/mercadopago/subscription";
import { redirect } from "next/navigation";
import { PlatformLayoutShell } from "@/components/platform/PlatformLayoutShell";
import { SubscribeButton } from "@/components/platform/SubscribeButton";
import { Crown } from "lucide-react";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Leer la ruta actual y el rol del header (inyectados por el middleware)
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Verificar suscripción usando Admin Client
  const adminClient = createAdminClient();
  
  // 1. Obtener el perfil para ver el rol
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // 2. Obtener la suscripción
  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("status, mp_preapproval_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let effectiveStatus = subscription?.status ?? "none";

  // Si la DB dice "pending" pero ya tenemos el ID de MP, consultamos directamente
  // a Mercado Pago antes de bloquear al usuario. Esto resuelve el caso donde el webhook
  // todavía no llegó pero el usuario ya pagó y volvió a la app.
  if (effectiveStatus === "pending" && subscription?.mp_preapproval_id) {
    try {
      const mpData = await getSubscriptionStatus(subscription.mp_preapproval_id);
      if (mpData.status === "authorized") {
        await adminClient
          .from("subscriptions")
          .update({ status: "active" })
          .eq("user_id", user.id);
        effectiveStatus = "active";
      }
    } catch (err) {
      // Si MP falla (timeout, 500, red), preferimos falso positivo (acceso) sobre
      // falso negativo (bloqueo injusto). El cron job corregirá el estado en la DB.
      console.error("[layout] Error consultando MP — cediendo acceso por precaución", {
        user_id: user.id,
        mp_preapproval_id: subscription.mp_preapproval_id,
        error: err instanceof Error ? err.message : String(err),
      });
      effectiveStatus = "active";
    }
  }

  const isActive = effectiveStatus === "active";
  const isAdmin = profile?.role === "admin";
  const isSuccessPage = pathname.startsWith("/suscripcion/exito");
  const isPerfilPage = pathname.startsWith("/perfil");

  // Si no está activo ni es admin, bloquear contenido EXCEPTO en la página de éxito y perfil
  const shouldBlock = !isActive && !isAdmin && !isSuccessPage && !isPerfilPage;

  return (
    <PlatformLayoutShell>
      {shouldBlock ? (
        <div className="max-w-2xl mx-auto text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Crown className="h-16 w-16 text-gold mx-auto mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
          <h1 className="text-3xl font-bold mb-4">Activa tu suscripción</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Para acceder a los beneficios exclusivos de IWON AUDIOVISUAL (cursos, sorteos, filmaciones y más), necesitas una suscripción activa.
          </p>
          <div className="p-1 rounded-2xl bg-gradient-to-r from-gold/20 via-gold to-gold/20 inline-block">
            <SubscribeButton />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Suscripción mensual de $14.999 ARS. Cancelá cuando quieras.
          </p>
        </div>
      ) : (
        children
      )}
    </PlatformLayoutShell>
  );
}


