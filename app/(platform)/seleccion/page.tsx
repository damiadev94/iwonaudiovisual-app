export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { SelectionEventCard } from "@/components/platform/SelectionEventCard";
import { Star } from "lucide-react";
import type { Selection, SelectionApplication } from "@/types";

export default async function SeleccionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = createAdminClient();

  const { data: sub } = await adminClient
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .in("status", ["active", "pending"])
    .maybeSingle();

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  if (!sub && !isAdmin) redirect("/dashboard");

  // Fetch open selections
  const { data: openSelections } = await adminClient
    .from("selections")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  // Fetch user's existing applications
  const selectionIds = (openSelections || []).map((s) => s.id);
  let userApplications: SelectionApplication[] = [];
  if (selectionIds.length > 0) {
    const { data } = await adminClient
      .from("selection_applications")
      .select("*")
      .eq("user_id", user.id)
      .in("selection_id", selectionIds);
    userApplications = (data || []) as SelectionApplication[];
  }

  const appliedIds = new Set(userApplications.map((a) => a.selection_id));

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
          <Star className="h-8 w-8 text-gold shrink-0 animate-pulse" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Selección de Artistas
          </h1>
          <p className="text-muted-foreground mt-2 text-lg font-light leading-relaxed max-w-2xl">
            Participá en nuestras convocatorias enviando tu canción. Los seleccionados acceden
            a producciones de nivel profesional y filmaciones exclusivas.
          </p>
        </div>
      </div>

      {openSelections && openSelections.length > 0 ? (
        <div className="space-y-6">
          {openSelections.map((selection) => (
            <SelectionEventCard
              key={selection.id}
              selection={selection as Selection}
              userId={user.id}
              hasApplied={appliedIds.has(selection.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-3">
          <Star className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground text-lg">No hay convocatorias abiertas en este momento.</p>
          <p className="text-sm text-muted-foreground/60">
            Volvé pronto para no perderte la próxima selección.
          </p>
        </div>
      )}
    </div>
  );
}
