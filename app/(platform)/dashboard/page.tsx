export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventCalendar } from "@/components/platform/EventCalendar";
import { BookOpen, Film, Gift, Users, ArrowRight, Crown } from "lucide-react";
import Link from "next/link";

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
    .eq("status", "active")
    .single();

  const isActive = subscription?.status === "active";

  if (!isActive) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Crown className="h-16 w-16 text-gold mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Activa tu suscripcion</h1>
        <p className="text-muted-foreground mb-8">
          Para acceder a todos los beneficios de Iwon Audiovisual necesitas una suscripcion activa.
        </p>
        <Link href="/api/subscription/create">
          <Button className="bg-gold hover:bg-gold-light text-black font-bold text-lg px-8 py-6 h-auto">
            Enviar mi canción por $9.999/mes
            <ArrowRight className="ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Hola, {profile?.artist_name || profile?.full_name || "Artista"}
        </h1>
        <p className="text-muted-foreground">Bienvenido a tu plataforma de impulso artistico.</p>
      </div>

      {/* Subscription status */}
      <Card className="bg-gold/5 border-gold/20">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-gold" />
            <div>
              <p className="font-medium">Suscripcion activa</p>
              <p className="text-sm text-muted-foreground">Plan Iwon - $9.999/mes</p>
            </div>
          </div>
          <Badge className="bg-iwon-success/10 text-iwon-success border-iwon-success/20">Activa</Badge>
        </CardContent>
      </Card>

      {/* Quick access grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/cursos", icon: BookOpen, title: "Cursos", desc: "Formacion continua", color: "text-purple-400" },
          { href: "/seleccion", icon: Users, title: "Seleccion", desc: 'Aplica a "Los 50"', color: "text-gold" },
          { href: "/promos", icon: Film, title: "Promos", desc: "Filmacion accesible", color: "text-blue-400" },
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
              <p>Aun no hay actividad reciente. Explora los cursos o participa en un sorteo para comenzar.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
