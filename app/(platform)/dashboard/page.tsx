export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventCalendar } from "@/components/platform/EventCalendar";
import { BookOpen, Film, Gift, Users, Crown } from "lucide-react";
import Link from "next/link";
import { SubscribeButton } from "@/components/platform/SubscribeButton";
import { SubscriptionStatus } from "@/components/platform/SubscriptionStatus";
import type { Subscription } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isActive = subscription?.status === "active";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Hola, {profile?.artist_name || profile?.full_name || "Artista"}
        </h1>
        <p className="text-muted-foreground">Bienvenido a tu plataforma de impulso artístico.</p>
      </div>

      {/* Subscription status */}
      <Card className={isActive ? "bg-gold/5 border-gold/20" : "bg-iwon-card border-iwon-border"}>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Crown className={`h-5 w-5 ${isActive ? "text-gold" : "text-muted-foreground"}`} />
            <div>
              <p className="font-medium">Suscripción</p>
              <p className="text-sm text-muted-foreground">
                {isActive ? "Plan Iwon - $14.999/mes" : "Sin acceso completo a la plataforma"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SubscriptionStatus subscription={subscription as Subscription | null} />
            {!isActive && <SubscribeButton compact />}
          </div>
        </CardContent>
      </Card>

      {/* Quick access grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/cursos", icon: BookOpen, title: "Cursos", desc: "Formación continua", color: "text-purple-400" },
          { href: "/seleccion", icon: Users, title: "Selección", desc: 'Aplicá a "Los 50"', color: "text-gold" },
          { href: "/promos", icon: Film, title: "Promos", desc: "Filmación accesible", color: "text-blue-400" },
          { href: "/sorteos", icon: Gift, title: "Sorteos", desc: "Premios exclusivos", color: "text-iwon-success" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="bg-iwon-card border-iwon-border hover:border-gold/30 transition-all h-full cursor-pointer group">
              <CardContent className="pt-6">
                <item.icon className={`h-8 w-8 ${item.color} mb-3`} />
                <h3 className="font-semibold group-hover:text-gold transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EventCalendar />
        <Card className="bg-iwon-card border-iwon-border">
          <CardHeader>
            <CardTitle className="text-lg">Tu actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>Aún no hay actividad reciente. Explorá los cursos o participá en un sorteo para empezar.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
