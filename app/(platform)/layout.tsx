import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    .select("status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const isActive = subscription?.status === "active";
  const isAdmin = profile?.role === "admin";
  const isSuccessPage = pathname.startsWith("/suscripcion/exito");

  // Si no está activo ni es admin, bloquear contenido EXCEPTO en la página de éxito
  const shouldBlock = !isActive && !isAdmin && !isSuccessPage;

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
            Suscripción mensual de $14.999 ARS. Cancela cuando quieras.
          </p>
        </div>
      ) : (
        children
      )}
    </PlatformLayoutShell>
  );
}


