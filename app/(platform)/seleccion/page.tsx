export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { CancionUploadForm } from "@/components/platform/CancionUploadForm";
import { RaffleCountdown } from "@/components/platform/RaffleCountdown";
import { Music2, Star } from "lucide-react";
import type { SongSubmission, Raffle } from "@/types";

export default async function SeleccionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminClient = createAdminClient();

  // Solo usuarios con suscripcion activa o pendiente pueden acceder (o admin)
  const { data: sub } = await adminClient
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .in("status", ["active", "pending"])
    .maybeSingle();

  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

  if (!sub && !isAdmin) redirect("/dashboard");

  // Buscar próximo sorteo activo
  const { data: raffleData } = await adminClient
    .from("raffles")
    .select("*")
    .eq("status", "active")
    .gte("draw_date", new Date().toISOString())
    .order("draw_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  // Buscar submission existente del usuario
  const { data: existingSubmission } = await adminClient
    .from("song_submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Raffle Section */}
      <section className="space-y-4">
        <RaffleCountdown raffle={raffleData as Raffle | null} />
      </section>

      {/* Song Submission Section */}
      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <Star className="h-8 w-8 text-gold shrink-0 animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              Selección de Artistas
            </h1>
            <p className="text-muted-foreground mt-2 text-lg font-light leading-relaxed max-w-2xl">
              Subí tu mejor track para nuestra evaluación de A&R. Los seleccionados podrán acceder a producciones de nivel profesional y filmaciones exclusivas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <CancionUploadForm
              userId={user.id}
              existingSubmission={existingSubmission as SongSubmission | null}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-iwon-card border border-iwon-border rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Music2 className="h-16 w-16" />
              </div>
              <h3 className="font-bold text-lg mb-4 text-white">Proceso IWON</h3>
              <ul className="space-y-5 text-sm">
                <li className="flex gap-4">
                  <span className="text-gold font-black bg-gold/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">1</span>
                  <p className="text-muted-foreground leading-snug">Subí tu demo en MP3 o WAV (máximo 50MB).</p>
                </li>
                <li className="flex gap-4">
                  <span className="text-gold font-black bg-gold/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">2</span>
                  <p className="text-muted-foreground leading-snug">Nuestro equipo de expertos escuchará cada propuesta.</p>
                </li>
                <li className="flex gap-4">
                  <span className="text-gold font-black bg-gold/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">3</span>
                  <p className="text-muted-foreground leading-snug">Si tu track califica, nos contactaremos para coordinar tu producción.</p>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-gold/5 to-transparent border border-gold/10 rounded-2xl">
              <p className="text-xs text-gold font-bold uppercase tracking-wider mb-2">Tip de éxito</p>
              <p className="text-sm text-balance leading-relaxed italic text-muted-foreground">
                "Asegurate de que tu demo tenga buena calidad de audio. No tiene que estar masterizado, pero sí que se aprecie tu visión artística."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
