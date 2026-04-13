export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { SubscriberTable } from "@/components/admin/SubscriberTable";

export default async function SuscriptoresPage() {
  const supabase = createAdminClient();

  const { data: subscribers } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, artist_name, role, is_active, created_at, subscriptions(id, status)"
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suscriptores</h1>
        <p className="text-muted-foreground">
          Gestion de usuarios registrados en la plataforma.
        </p>
      </div>

      <SubscriberTable subscribers={subscribers ?? []} />
    </div>
  );
}
