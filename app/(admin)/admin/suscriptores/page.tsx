export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { SubscriberTable } from "@/components/admin/SubscriberTable";

export default async function SuscriptoresPage() {
  const supabase = createAdminClient();

  const { data: subscribers } = await supabase
    .from("profiles")
    .select("*, subscriptions(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Suscriptores</h1>
        <p className="text-muted-foreground">Gestion de todos los usuarios registrados.</p>
      </div>

      <SubscriberTable subscribers={subscribers || []} />
    </div>
  );
}
