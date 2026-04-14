export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { CancionUploadForm } from "@/components/platform/CancionUploadForm";
import { Music2 } from "lucide-react";
import type { SongSubmission } from "@/types";

export default async function SeleccionPage() {
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
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start gap-3">
        <div className="p-3 bg-gold/10 rounded-xl">
          <Music2 className="h-7 w-7 text-gold shrink-0" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Mándanos tu canción</h1>
          <p className="text-muted-foreground mt-1 max-w-xl">
            Sube tu mejor track para ser evaluado por nuestro equipo. Los artistas 
            seleccionados tendrán la oportunidad de filmar su videoclip oficial con equipamiento de nivel cine.
          </p>
        </div>
      </div>

      <CancionUploadForm
        userId={user.id}
        existingSubmission={existingSubmission as SongSubmission | null}
      />

      <div className="bg-iwon-card border border-iwon-border rounded-xl p-6">
        <h3 className="font-semibold mb-3">¿Cómo funciona la selección?</h3>
        <ul className="space-y-3 text-sm text-balance">
          <li className="flex gap-2">
            <span className="text-gold font-bold">1.</span>
            <span className="text-muted-foreground">Sube tu demo en formato MP3 o WAV (máximo 50MB).</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gold font-bold">2.</span>
            <span className="text-muted-foreground">Nuestro equipo de A&R escuchará tu propuesta enfocándose en originalidad y potencial.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gold font-bold">3.</span>
            <span className="text-muted-foreground">Si eres seleccionado, nos pondremos en contacto contigo para coordinar la producción de tu material.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
