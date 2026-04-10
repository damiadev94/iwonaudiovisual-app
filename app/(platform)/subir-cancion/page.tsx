export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { CancionUploadForm } from "@/components/platform/CancionUploadForm";
import { Mic2 } from "lucide-react";
import type { SongSubmission } from "@/types";

export default async function SubirCancionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = createAdminClient();

  // Solo usuarios con suscripcion activa o pendiente pueden acceder
  const { data: sub } = await adminClient
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .in("status", ["active", "pending"])
    .maybeSingle();

  if (!sub) redirect("/dashboard");

  // Buscar submission existente del usuario
  const { data: existingSubmission } = await adminClient
    .from("song_submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-start gap-3">
        <Mic2 className="h-7 w-7 text-gold mt-0.5 shrink-0" />
        <div>
          <h1 className="text-2xl font-bold">Subi tu cancion</h1>
          <p className="text-muted-foreground mt-1">
            Envia tu demo en formato MP3 o WAV. Nuestro equipo lo revisara para
            definir a los artistas seleccionados para filmar su videoclip.
          </p>
        </div>
      </div>

      <CancionUploadForm
        userId={user.id}
        existingSubmission={existingSubmission as SongSubmission | null}
      />
    </div>
  );
}
