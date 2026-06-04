import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSubscriptionStatus } from "@/lib/mercadopago/subscription";
import { redirect } from "next/navigation";
import { PlatformLayoutShell } from "@/components/platform/PlatformLayoutShell";
import { SubscribeButton } from "@/components/platform/SubscribeButton";
import { Crown } from "lucide-react";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * Maps the current pathname to the promotion content type used in the
 * promotions table. Returns null for paths with no content-type restriction.
 */
function getContentTypeForPath(pathname: string): string | null {
  if (pathname.startsWith("/cursos")) return "courses";
  if (pathname.startsWith("/sorteos")) return "raffles";
  if (pathname.startsWith("/seleccion")) return "selections";
  if (pathname.startsWith("/promos")) return "promos";
  return null;
}

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

  // Read the current path injected by middleware
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  const adminClient = createAdminClient();

  // 1. Get profile for role check
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // 2. Get latest subscription
  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("status, mp_preapproval_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let effectiveStatus = subscription?.status ?? "none";

  // If the DB says "pending" but we have an MP preapproval ID, verify directly
  // with MercadoPago before blocking the user. Handles the race condition where
  // the user paid and returned to the app before the webhook arrived.
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
      // If MP is unreachable, grant access to avoid a false negative.
      // The cron job will reconcile the DB state later.
      console.error("[layout] Error consultando MP — cediendo acceso por precaución", {
        user_id: user.id,
        mp_preapproval_id: subscription.mp_preapproval_id,
        error: err instanceof Error ? err.message : String(err),
      });
      effectiveStatus = "active";
    }
  }

  // 3. Check active promotions that cover this user's current path
  const now = new Date().toISOString();
  const { data: activePromotions } = await adminClient
    .from("promotions")
    .select("id, name, type, ends_at")
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now);

  const promos = activePromotions ?? [];
  const contentType = getContentTypeForPath(pathname);

  const hasPromoAccess = promos.some(
    (p) =>
      p.type === "full_access" ||
      (contentType !== null && p.type === contentType)
  );

  const isActive = effectiveStatus === "active" || hasPromoAccess;
  const isAdmin = profile?.role === "admin";
  const isSuccessPage = pathname.startsWith("/suscripcion/exito");
  const isPerfilPage = pathname.startsWith("/perfil");

  // Block content for users without active subscription, promo access, or admin role
  const shouldBlock = !isActive && !isAdmin && !isSuccessPage && !isPerfilPage;

  // Find the most relevant promo to show in the banner:
  // prefer full_access promos, then fall back to first available
  const relevantPromo =
    promos.find((p) => p.type === "full_access") ?? promos[0] ?? null;

  const endDate = relevantPromo
    ? new Date(relevantPromo.ends_at).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        timeZone: "America/Argentina/Buenos_Aires",
      })
    : null;

  return (
    <PlatformLayoutShell>
      {promos.length > 0 && relevantPromo && endDate && (
        <div className="bg-gold/10 border-b border-gold/20 px-4 py-2 text-center text-sm text-gold">
          {relevantPromo.name} — acceso gratuito hasta el {endDate}
        </div>
      )}

      {shouldBlock ? (
        <div className="max-w-2xl mx-auto text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Crown className="h-16 w-16 text-gold mx-auto mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
          <h1 className="text-3xl font-bold mb-4">Activa tu suscripción</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Para acceder a los beneficios exclusivos de IWON AUDIOVISUAL (cursos, sorteos, filmaciones y más), necesitas una suscripción activa.
          </p>
          <div className="p-1 rounded-2xl bg-linear-to-r from-gold/20 via-gold to-gold/20 inline-block">
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
